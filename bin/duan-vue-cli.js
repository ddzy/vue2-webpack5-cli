#!/usr/bin/env node

const { Command } = require('commander');
const chalk = require('chalk');
const fs = require('fs');
const icon = require('log-symbols');
const inquirer = require('inquirer');
const download = require('download-git-repo');
const handlebars = require('handlebars');
const ora = require('ora');

const cmd = new Command();

cmd
	.command('init <folderName>')
	.description(icon.info, chalk.grey('初始化项目'))
	.action((folderName) => {
		if (fs.existsSync(folderName)) {
			console.log(icon.error, chalk.red('项目已存在'));
			return;
		}
		inquirer
			.prompt([
				{
					name: 'description',
					message: '请输入项目描述',
				},
				{
					name: 'author',
					message: '请输入作者名称',
				},
			])
			.then(({ description, author }) => {
				// 拉取 git 项目
				// github:owner/name
				// https://github.com/ddzy/vue2-webpack5-template.git
				const spining = ora('正在下载模板...');
				spining.start();

				download(
					'github:ddzy/vue2-webpack5-template#main',
					folderName,
					{
						clone: true,
					},
					(err) => {
						if (!err) {
							spining.succeed();

							// 将项目元信息写入 package.json
							const metaInfo = {
								name: folderName,
								description,
								author,
								repository: '',
								keywords: [],
							};
							const packagePath = `${folderName}/package.json`;
							if (fs.existsSync(packagePath)) {
								const packageContent = JSON.parse(fs.readFileSync(packagePath));

								packageContent.name = metaInfo.name;
								packageContent.description = metaInfo.description;
								packageContent.author = metaInfo.author;
								packageContent.repository = metaInfo.repository;
								packageContent.keywords = metaInfo.keywords;

								const result = handlebars.compile(
									JSON.stringify(packageContent, null, 2),
								)(metaInfo);

								fs.writeFileSync(packagePath, result);
							}

							console.log(icon.success, chalk.green('项目初始化完成'));
						} else {
							spining.fail();

							console.log(icon.error, chalk.red(err));
						}
					},
				);
			});
	});

cmd.parse(process.argv);
