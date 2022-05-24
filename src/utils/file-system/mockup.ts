import { Stats } from 'fs';
import { FileSystemProvider } from '.';

class FileSystemMockup implements FileSystemProvider {
  exists(_dir: string) {
    return true;
  }

  async createDir(_dir: string, _options: { recursive: boolean }) {
    return '';
  }

  async writeFile(_path: string, _data: string, _options: any) {
    return;
  }

  async readdir(_dir: string) {
    return [];
  }

  async stats(_path: string) {
    return new Stats();
  }

  async delete(_path: string) {
    return;
  }
}

const fileSystemMockup = new FileSystemMockup();

export default fileSystemMockup;
