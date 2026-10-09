<div align="center">

# pi-provider-tokenflux

用于 [TokenFlux](https://tokenflux.dev/home) 的 Pi provider 扩展

[![npm version](https://img.shields.io/npm/v/pi-provider-tokenflux)](https://www.npmjs.com/package/pi-provider-tokenflux)
[![License](https://img.shields.io/github/license/Twisuki/pi-provider-tokenflux)](./LICENSE)
[![Issues](https://img.shields.io/github/issues/Twisuki/pi-provider-tokenflux)](https://github.com/Twisuki/pi-provider-tokenflux/issues)

[English](./README.md) | [简体中文](./README_ZH.md)

</div>

## 安装

使用 [Pi](https://pi.dev) 安装：

```bash
pi install npm:pi-provider-tokenflux
```

也可以直接从 GitHub 安装：

```bash
pi install git:github.com/Twisuki/pi-provider-tokenflux
```

## 快速开始

启动 Pi，添加一个 provider，然后使用你的 [TokenFlux](https://tokenflux.dev/home) API key 登录：

```text
/tf-provider-add my-tokenflux
/login my-tokenflux
```

使用 `/model` 选择模型。认证后会自动从 TokenFlux 获取可用模型，已添加的 provider 会在 Pi 启动时恢复。

也可以通过 `TOKENFLUX_API_KEY` 环境变量提供 API key。添加不同名称的 provider 即可使用多个账号。

## 命令

| 命令                         | 说明                                                       |
| ---------------------------- | ---------------------------------------------------------- |
| `/tf-provider-add [name]`    | 添加 provider，省略名称时会提示输入。                      |
| `/tf-provider-list`          | 列出已配置的 provider 及其凭据保存状态。                   |
| `/tf-provider-remove <name>` | 移除 provider。如果已保存凭据，请先执行 `/logout <name>`。 |

如有问题或建议，请提交 [GitHub issue](https://github.com/Twisuki/pi-provider-tokenflux/issues)。

## 许可证

[MIT](./LICENSE)
