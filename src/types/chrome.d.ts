// 确保全局 chrome 命名空间可用
import 'chrome-types';

declare global {
    const chrome: typeof import('chrome-types');
}