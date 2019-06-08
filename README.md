# node-skm
[![npm](https://img.shields.io/npm/v/skm-ng.svg?style=flat-square)](https://npmjs.org/package/skm-ng)
[![Build Status](https://img.shields.io/travis/ah-yu/node-skm.svg?style=flat-square)](https://www.travis-ci.org/ah-yu/node-skm.svg?branch=master)
[![codecov](https://img.shields.io/codecov/c/github/ah-yu/node-skm.svg?style=flat-square)](https://codecov.io/gh/ah-yu/node-skm) [![Greenkeeper badge](https://badges.greenkeeper.io/ah-yu/node-skm.svg)](https://greenkeeper.io/)

Yet another simple ssh key manager impleted by node.js. It helps you to manage your multiple SSH keys easily!

## Features
- [x] initialize skm store just for the first time
- [x] list all your ssh keys
- [x] use ssh key by alias
- [x] delete ssh key by alias
- [x] create ssh key by alias
- [x] rename ssh key's alias
- [x] backup ssh keys
- [ ] restore ssh keys



## Installation
```shell
$ git@github.com:ah-yu/node-skm.git
$ cd node-skm
$ npm install && npm link
```
or
```shell
$ npm install skm-ng -g
```

## Usage
```shell
▶ skm -h

  Usage: skm [options] [command]


  Options:

    -V, --version  output the version number
    -h, --help     output usage information


  Commands:

    ls                        ls all ssh keys
    init                      init skm store
    use [alias]               use ssh key by alias
    delete [alias]            delete ssh key by alias
    create [options] [alias]  create ssh key
    rn [alias...]             rename alias
    backup                    back ssh keys in skm store
```

### initialize skm store(just for the first time use)
```shell
$ skm init
> init skm store successfully!
```

### list all ssh keys
```shell
$ skm ls
        alpha
        beta
->      default
        dev
```

### use certain ssh key by alias
```shell
$ skm use alpha
> now using SSH key: alpha
```

### delete certain ssh key by alias
```shell
$ skm delete dev
> delete dev ssh key successfully
```

### create ssh key with alias and comment
```shell
$ skm create dev "aa@bb.com"
> Generating public/private rsa key pair.
Your identification has been saved in /Users/buji/.skm/dev/id_rsa.
Your public key has been saved in /Users/buji/.skm/dev/id_rsa.pub.
The key fingerprint is:
SHA256:zyiOk3U/Qug5Np8a1HCD3NV6sCYdbaocPJV1AzuEzvQ undefined
The key's randomart image is:
+---[RSA 2048]----+
|          .*+.o  |
|     . o .B.+o . |
|      +.+* Oo    |
|       +=.O E.   |
|      .oS* .     |
|     .o =+       |
|     +o+..o      |
|    oo*o..o      |
|    .oo=o. .     |
+----[SHA256]-----+
create dev ssh key successfully!
```
### rename ssh key alias
```shell
skm rn dev beta
> rename dev to beta successfully
```

### backup ssh keys in skm store
```shell
skm backup
> backup in /Users/buji/skm-2017-11-21T04:52:28.002Z.zip
  back up keys successfully!
```

## Licence
[MIT License](https://github.com/TimothyYe/skm/blob/master/LICENSE)