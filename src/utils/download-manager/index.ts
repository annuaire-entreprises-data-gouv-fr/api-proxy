import fileSystem, { FileSystemProvider } from '../file-system';
import randomId from '../helpers/random-id';

/**
 * INPI Pdf generation can be very slow
 */
const DIRECTORY = process.env.PDF_DOWNLOAD_DIRECTORY as string;
const FILES_LIFESPAN = 30 * 60 * 1000;
const FILES_CLEANING_FREQUENCY = 1 * 60 * 1000;
const QUEUE_INTERVAL = 500;

interface IStatusMetaData {
  status: string;
  isPending: boolean;
}

const STATUSES: { [key: string]: IStatusMetaData } = {
  pending: {
    status: 'pending',
    isPending: true,
  },
  retried: {
    status: 'retried',
    isPending: true,
  },
  aborted: {
    status: 'aborted',
    isPending: false,
  },
  downloaded: {
    status: 'downloaded',
    isPending: false,
  },
};

export class PDFDownloader {
  _initialized = false;
  pendingDownloads: { [key: string]: boolean } = {};
  _downloadQueue = [] as (() => void)[];

  constructor(
    private readonly fileSystem: FileSystemProvider,
    private readonly directory: string,
    private readonly shouldCleanOldFiles = true,
    private readonly shouldRunQueue = true
  ) {}

  async init() {
    if (!this.directory) {
      throw new Error('Download manager : directory is not defined');
    }

    if (!this.fileSystem.exists(this.directory)) {
      await this.fileSystem.createDir(this.directory, { recursive: true });
    }

    if (this.shouldCleanOldFiles) {
      this.cleanOldFiles();
    }

    if (this.shouldRunQueue) {
      this.runQueue();
    }

    this._initialized = true;
  }

  /**
   * Queue runner - every QUEUE_INTERVAL ms it runs a downloadCallback from queue
   * Attempt at avoiding INPI's ratelimiting
   */
  async runQueue() {
    const downloadCallback = this._downloadQueue.shift();

    if (downloadCallback) {
      downloadCallback();
    }

    setTimeout(() => this.runQueue(), QUEUE_INTERVAL);
  }

  /**
   * Create a download job that save file on disk
   * With several retry
   *
   * @param downloadAttempts
   * @param errorCallBack
   * @returns
   */
  createJob(
    downloadAttempts: (() => Promise<string>)[],
    errorCallBack: (e: any) => void
  ) {
    const slug = randomId();
    this.pendingDownloads[slug] = true;

    const callback = () =>
      this.download(0, slug, downloadAttempts, errorCallBack);

    this._downloadQueue.push(callback);
    return slug;
  }

  async download(
    index: number,
    slug: string,
    downloadAttempts: (() => Promise<string>)[],
    errorCallBack: (e: any) => void
  ) {
    if (!this._initialized) {
      await this.init();
    }

    try {
      const currentDownload = downloadAttempts[index];
      const file = await currentDownload();
      await this.savePdfOnDisk(slug, file);
      this.removePendingDownload(slug);

      // file successfully downloaded -> we can stop here
      return;
    } catch (error: any) {
      console.log(error.toString());

      const isLastAttempt = index === downloadAttempts.length;
      if (isLastAttempt) {
        this.removePendingDownload(slug);
        errorCallBack(error);
      } else {
        const callback = () =>
          this.download(index + 1, slug, downloadAttempts, errorCallBack);

        this._downloadQueue.push(callback);
      }
    }
  }

  removePendingDownload(slug: string) {
    delete this.pendingDownloads[slug];
  }

  async savePdfOnDisk(slug: string, pdf: any) {
    await this.fileSystem.writeFile(`${this.directory}/${slug}.pdf`, pdf, {});
  }

  getDownloadStatus(slug: string): IStatusMetaData {
    const fileMetaData = this.pendingDownloads[slug];
    if (fileMetaData) {
      return STATUSES.pending;
    }
    if (this.fileSystem.exists(`${this.directory}/${slug}.pdf`)) {
      return STATUSES.downloaded;
    }
    return STATUSES.aborted;
  }

  cleanOldFiles = async () => {
    const now = new Date().getTime();
    try {
      const files = await this.fileSystem.readdir(this.directory);
      await Promise.all(
        files.map(async (file) => {
          const filePath = `${this.directory}/${file}`;
          const stats = await this.fileSystem.stats(filePath);
          const isTooOld = now - stats.birthtimeMs > FILES_LIFESPAN;
          if (isTooOld) {
            await this.fileSystem.delete(filePath);
          }
        })
      );
    } catch (e: any) {
      throw new Error('Download manager : file cleaning failed');
    }
    setTimeout(() => this.cleanOldFiles(), FILES_CLEANING_FREQUENCY);
  };
}

const pdfDownloader = new PDFDownloader(fileSystem, DIRECTORY);

export default pdfDownloader;
