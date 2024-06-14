
// 初始化版本导入
await import('./tool/getVer.js');

// 初始化数据库
await import('./util/db.js');

// 启动HTTP服务器
await import('./httpServer.js');
