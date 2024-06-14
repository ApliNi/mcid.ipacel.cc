
import { readFileSync } from 'node:fs';
import path from 'node:path';
import fastify from 'fastify';
import { logger } from './util/logger.js';
import { getIP } from './util/ip.js';


export const server = fastify({
	http2: true,
	https: {
		allowHTTP1: true,
		key: readFileSync('./data/cert/_.key'),
		cert: readFileSync('./data/cert/_.pem'),
	}
});

// 数据检查
server.addHook('onRequest', (req, reply, done) => {

	// 添加自定义数据
	req.ipac = {
		ip: getIP(req),
	};

	// 不允许访问 index.html
	if(req.url === '/index.html'){
		reply.code(404).send();
		return;
	}

	// ping 测试
	if(req.url === '/--IPACEL-TEST'){
		reply.code(200).send('ok');
		return;
	}

	// 输出日志
	logger.info(`[HTTP.req] IP=${req.ipac.ip} | PATH=${req.url}`);

	// 调用 done 回调继续路由处理
	done();
});

// 静态文件服务器
server.register(import('@fastify/static'), {
	// 静态文件目录
	root: path.join(path.resolve(), './www/'),
	// Cache-Control 响应头
	cacheControl: true,
	maxAge: 365 * 24 *  60 * 60 * 1000,
});


// 数据压缩, 跳过静态文件服务器
await server.register(import('@fastify/compress'), {
	global: true,
	encodings: ['deflate', 'gzip'],
});


// ------------------------------------------------------------------------------------ //


await import('./httpApi/api.list.js').then((mode) => {
	server.all('/api.list/', mode.on);
});

await import('./httpApi/api.detailed.js').then((mode) => {
	server.all('/api.detailed/', mode.on);
});


// ------------------------------------------------------------------------------------ //


// 错误处理
server.setErrorHandler((err, req, reply) => {
	reply.status(500);
	// reply.send({error: '服务器错误'});
	reply.send();
	logger.error(`[HTTP.Err] 未捕获的错误 [/] `, err);
});

// 404
server.register((childContext, _, done) => {
	// 404
    childContext.setNotFoundHandler((req, reply) => {
		// 如果是图片则返回404, 否则跳转到主页面
		if(/.png$/.test(req.url)){
			return reply.code(404).send();
		}else{
			return reply.redirect('/');
		}
    });
    done();
});

server.listen({port: 61474, host: '::'});

logger.mark(`[HTTP.SERVER] Web服务器已启动`);
