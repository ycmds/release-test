# MACROBE - PARALLEL

[![NPM version](https://badgen.net/npm/v/@macrobe/parallel)](https://www.npmjs.com/package/@macrobe/parallel)
[![Tests](https://github.com/ycmds/release-test/actions/workflows/release.yml/badge.svg)](https://github.com/ycmds/release-test/actions/workflows/release.yml)
[![TypeScript + ESM](https://img.shields.io/badge/TypeScript-Ready-brightgreen.svg)](https://www.typescriptlang.org/)
[![Install size](https://packagephobia.now.sh/badge?p=@macrobe/parallel)](https://packagephobia.now.sh/result?p=@macrobe/parallel)
[![Bundle size](https://img.shields.io/bundlephobia/minzip/@macrobe/parallel.svg)](https://bundlephobia.com/result?p=@macrobe/parallel)
[![License](https://badgen.net/github/license/ycmds/release-test)](https://github.com/ycmds/release-test/blob/main/LICENSE)
[![Ask me in Telegram](https://img.shields.io/badge/Ask%20me%20in-Telegram-brightblue.svg)](https://t.me/isuvorov)


<div align="center">
  <p><strong>❤️‍🔥 The BEST example of release tools</strong></p>
</div>


**🚀 Modern**: Built with ESM modules and TypeScript  
**🪶 Lightweight**: Tree-shakable functions for optimal bundle size (~0.4kb)
**💪 Type-safe**: Full TypeScript support with comprehensive type definitions  
**⚡ Fast**: Optimized algorithms for maximum performance  
**🎯 Focused**: Essential async utilities without bloat  
**📦 Zero Dependencies**: No external dependencies

```ts
import { map } from '@macrobe/parallel';

const results = await map([1, 2, 3], async (num) => num * 2);
// => [2, 4, 6]
```
