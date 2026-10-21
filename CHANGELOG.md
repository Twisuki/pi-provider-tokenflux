# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-10-21

### Added

- Anthropic 协议支持. 模型按 builtin 表查得协议, `claude-*` 自动走 `/v1/messages`, 其余走 OpenAI 协议端点.

### Changed

- **Breaking** provider id 自动加 `tf-` 前缀, 展示名去前缀并加 `TokenFlux:` 前缀. `/login` 与 `/tf-provider-remove` 均需使用带前缀的 id.
- **Breaking** 配置 schema 升至 v3, 旧版本配置文件在读取时被备份为 `.bak` 后丢弃, 不做迁移.

### Fixed

- `/tf-provider-remove` 在 provider 已保存凭据时的提示改为 `Run /logout first.`, 此前误写成 `/logout <name>`, 而 `/logout` 不接受参数.

## [1.1.0] - 2026-10-09

### Added

- 兼容 TokenFlux 复合 Key. 模型 ID 带 `前缀/裸 ID` 形式时, 先剥离前缀再匹配 builtin 元数据.

## [1.0.1] - 2026-10-09

### Fixed

- 修复导入问题, `openAICompletionsApi` 改从 `@earendil-works/pi-ai/compat` 引入.

## [1.0.0] - 2026-10-09

### Added

- 从 `/v1/models` 拉取可用模型, 并按 builtin 表补齐上下文窗口, 计费与用量元数据.
- `/tf-provider-add`, `/tf-provider-list`, `/tf-provider-remove` 三个命令, 支持多 provider 多账号.
- Pi 启动时自动恢复已添加的 provider.
- `TOKENFLUX_API_KEY` 环境变量免登录.
- CI 与 npm 自动发版流程.

[Unreleased]: https://github.com/Twisuki/pi-provider-tokenflux/compare/v2.0.0...HEAD
[2.0.0]: https://github.com/Twisuki/pi-provider-tokenflux/compare/v1.1.0...v2.0.0
[1.1.0]: https://github.com/Twisuki/pi-provider-tokenflux/compare/v1.0.1...v1.1.0
[1.0.1]: https://github.com/Twisuki/pi-provider-tokenflux/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/Twisuki/pi-provider-tokenflux/releases/tag/v1.0.0
