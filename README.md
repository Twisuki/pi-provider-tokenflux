<div align="center">

# pi-provider-tokenflux

Pi provider extension for [TokenFlux](https://tokenflux.dev/home)

[![npm version](https://img.shields.io/npm/v/pi-provider-tokenflux)](https://www.npmjs.com/package/pi-provider-tokenflux)
[![License](https://img.shields.io/github/license/Twisuki/pi-provider-tokenflux)](./LICENSE)
[![Issues](https://img.shields.io/github/issues/Twisuki/pi-provider-tokenflux)](https://github.com/Twisuki/pi-provider-tokenflux/issues)

[English](./README.md) | [简体中文](./README_ZH.md)

</div>

## Installation

Install with [Pi](https://pi.dev):

```bash
pi install npm:pi-provider-tokenflux
```

Or install directly from GitHub:

```bash
pi install git:github.com/Twisuki/pi-provider-tokenflux
```

## Quick Start

Start Pi and add a provider, then log in with your [TokenFlux](https://tokenflux.dev/home) API key:

```text
/tf-provider-add my-tokenflux
/login my-tokenflux
```

Use `/model` to select a model. Available models are fetched from TokenFlux after authentication, and added providers are restored when Pi starts.

You can also supply your API key through the `TOKENFLUX_API_KEY` environment variable. Add providers with different names to use multiple accounts.

## Commands

| Command                      | Description                                                                  |
| ---------------------------- | ---------------------------------------------------------------------------- |
| `/tf-provider-add [name]`    | Add a provider. Prompts for a name if omitted.                               |
| `/tf-provider-list`          | List configured providers and their stored credential status.                |
| `/tf-provider-remove <name>` | Remove a provider. Run `/logout <name>` first if it has a stored credential. |

For bugs or suggestions, open a [GitHub issue](https://github.com/Twisuki/pi-provider-tokenflux/issues).

## License

[MIT](./LICENSE)
