

// 获取客户端ip, 返回字符串
export function getIP(req){
	// let exclude = [undefined, '::ffff:127.0.0.1', '::1', '127.0.0.1'];

	// // CF提供的客户端ip
	// if(exclude.indexOf(req.headers['cf-connecting-ip']) === -1){
	// 	return [req.headers['cf-connecting-ip'], 'cf-connecting-ip'];
	// }

	// // 上游代理提供的ip
	// if(exclude.indexOf(req.headers['x-forwarded-for']) === -1){
	// 	return [req.headers['x-forwarded-for'], 'x-forwarded-for'];
	// }

	// // Node.js 获取的地址
	// return [req.ip, ''];

	return (req.headers['cf-connecting-ip'] || req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.ip);
};
