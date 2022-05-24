import fileSystem, { FileSystemProvider } from '../file-system';
import randomId from '../helpers/random-id';

/**
 * INPI Pdf generation can be very slow
 */
const DIRECTORY = process.env.PDF_DOWNLOAD_DIRECTORY as string;
const FILES_LIFESPAN = 30 * 60 * 1000;
const FILES_CLEANING_FREQUENCY = 1 * 60 * 1000;

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

  constructor(
    private readonly fileSystem: FileSystemProvider,
    private readonly directory: string,
    private readonly shouldCleanOldFiles = true
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
    this._initialized = true;
  }

  /**
   * Create a download job that save file on disk
   * With several retry
   *
   * @param downloadCallBack
   * @param downloadFallBack - optional last try
   * @returns
   */
  createJob(
    retry: number,
    downloadCallBack: () => Promise<string>,
    downloadFallBack: () => Promise<string>,
    errorCallBack: (e: any) => void
  ) {
    const slug = randomId();
    this.pendingDownloads[slug] = true;
    this.downloadAndRetry(
      retry,
      slug,
      downloadCallBack,
      downloadFallBack,
      errorCallBack
    );
    return slug;
  }

  async downloadAndRetry(
    retry: number,
    slug: string,
    downloadCallBack: () => Promise<string>,
    downloadFallBack: () => Promise<string>,
    errorCallBack: (e: any) => void
  ) {
    if (!this._initialized) {
      await this.init();
    }

    try {
      const file = await downloadCallBack();
      await this.savePdfOnDisk(slug, file);
      this.removePendingDownload(slug);
    } catch (e: any) {
      if (retry > 1) {
        await this.downloadAndRetry(
          retry - 1,
          slug,
          downloadCallBack,
          downloadFallBack,
          errorCallBack
        );
      } else {
        try {
          const file = await downloadFallBack();
          await this.savePdfOnDisk(slug, file);
          this.removePendingDownload(slug);
        } catch (lastError: any) {
          this.removePendingDownload(slug);
          errorCallBack(lastError);
        }
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
