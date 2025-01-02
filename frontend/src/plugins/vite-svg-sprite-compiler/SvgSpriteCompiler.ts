import {promises as fs, watch} from "fs"
import {basename, join} from "path"
import SVGSprite from "svg-sprite"

import type {Plugin} from "vite"

export type SvgSpriteCompilerOptions = {
  iconsDir: string
  outputSprite: string
  typesOutput: string
}

export default (options: SvgSpriteCompilerOptions): Plugin => {
  let isBuild = false

  async function generateSpriteAndTypes() {
    const {iconsDir, outputSprite, typesOutput} = options

    const files = await fs.readdir(iconsDir)
    const svgFiles = files.filter((file) => file.endsWith(".svg"))
    const iconNames = svgFiles.map((file) => basename(file, ".svg"))

    const sprite = new SVGSprite({
      dest: ".",
      mode: {
        symbol: {
          sprite: "sprite.svg",
        },
      },
    })

    for (const file of svgFiles) {
      const filePath = join(iconsDir, file)
      const svgContent = await fs.readFile(filePath, "utf-8")
      sprite.add(filePath, null, svgContent)
    }

    await new Promise<void>((resolve, reject) => {
      sprite.compile((error, result) => {
        if (error) {
          reject(error)
          return
        }

        const spriteContent = result.symbol.sprite.contents.toString()
        fs.writeFile(outputSprite, spriteContent, "utf-8")
          .then(() => {
            console.log(`✅ Sprite generated at ${outputSprite}`)
            resolve()
          })
          .catch(reject)
      })
    })

    const typesContent = `
/* prettier-ignore */

/**
 * This file was autogenerated by vite-svg-sprite-compiler plugin.
 * Do not edit this file manually.
 */
export type IconName = ${iconNames.map((name) => `"${name}"`).join(" | ")};
    `.trim()
    await fs.writeFile(typesOutput, typesContent, "utf-8")

    console.log(`✅ Types generated at ${typesOutput}`)
  }

  function watchIcons() {
    const {iconsDir} = options

    watch(iconsDir, async (eventType, fileName) => {
      if (fileName && fileName.endsWith(".svg")) {
        console.log(`🔄 File ${eventType}: ${fileName}`)
        await generateSpriteAndTypes()
      }
    })
  }

  return {
    name: "vite-plugin-svg-sprite",
    configResolved(config) {
      isBuild = config.command === "build"
    },
    configureServer() {
      if (!isBuild) {
        watchIcons()
      }
    },
    async buildStart() {
      await generateSpriteAndTypes()
    },
  }
}
