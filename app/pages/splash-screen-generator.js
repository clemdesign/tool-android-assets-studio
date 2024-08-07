/*
 * Copyright 2016 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as studio from '../studio';

import {BaseGenerator} from '../base-generator';

const APP_ICON_SIZE = 180;
const BRAND_ICON_WIDTH = 80;
const BRAND_ICON_HEIGHT = 30;

export class SplashScreenGenerator extends BaseGenerator {

  // New Splash Generator API >= 31
  newSplashSets = [
    {
      key: 'app-icon',
      fieldName: 'appIcon',
      width: 288,
      height: 288,
      paddingX: 48,
      paddingY: 48,
      targetWidth: 0,
      targetHeight: 0,
      color: 'rgba(0, 0, 0, 0)',
      name: 'splash_icon'
    },
    {
      key: 'brand-icon',
      fieldName: 'brandIcon',
      width: 200,
      height: 80,
      paddingX: 64,
      paddingY: 40,
      targetWidth: 72,
      targetHeight: 28,
      color: 'rgba(0, 0, 0, 0)',
      name: 'splash_brand'
    }
  ]

  // Old Splash Generator API < 31
  oldSplashSets = [
    {
      width: 320,
      height: 480,
      dpi: 'xxxhdpi',
    },
    {
      width: 320,
      height: 533,
      dpi: 'xxhdpi',
    },
    {
      width: 360,
      height: 640,
      dpi: 'xhdpi',
    },
    {
      width: 320,
      height: 533,
      dpi: 'hdpi',
    },
    {
      width: 320,
      height: 400,
      dpi: 'mdpi',
    }
  ]

  setupForm() {
    super.setupForm();

    this.form = new studio.Form({
      id: 'iconform',
      container: '#inputs-form',
      fields: [
        new studio.Field('text', {
          title: 'Splash Screen configuration',
          helpText: 'Configure here the splash screen for your app.'
        }),
        new studio.Link('splashLink', {
          href: 'https://developer.android.com/develop/ui/views/launch/splash-screen?hl=en',
          text: 'More info on splash screens'
        }),
        new studio.ImageField('appIcon', {
          title: 'App Icon',
          helpText: 'Main icon that will be used to design the splash screen. Must be transparent.',
          maxFinalSize: {w: 720, h: 720}, // max render size, for SVGs
          defaultValueClipart: 'ac_unit',
          dropTarget: document.body,
          // imageOnly: true
        }),
        new studio.ImageField('brandIcon', {
          title: 'Branded Icon',
          helpText: 'Branded icon that will be added to the splash screen. Must be transparent.',
          maxFinalSize: {w: 800, h: 320}, // max render size, for SVGs
          defaultValueClipart: 'ac_unit',
          dropTarget: document.body,
          // imageOnly: true
        }),
        new studio.ColorField('bgColor', {
          title: 'Background Color',
          helpText: 'Set to transparent to not apply background color',
          defaultValue: 'rgba(0, 0, 0, 0)',
          alpha: true
        })
      ]
    });
    this.form.onChange(field => this.regenerateDebounced_());
  }

  regenerate() {
    let values = this.form.getValues();

    this.zipper.clear();
    this.zipper.setZipFilename(`android-assets.zip`);

    // New Splash Generator API >= 31
    this.densities.forEach(density => {
      let mult = studio.Util.getMultBaseMdpi(density);

      this.newSplashSets.forEach(set => {
        let totalWidth = set.width;
        let totalHeight = set.height;
        let paddingX = Math.min(totalWidth - 1, set.paddingX);
        let paddingY = Math.min(totalHeight - 1, set.paddingY);
        let iconSize = studio.Util.multRound(
          {w: totalWidth, h: totalHeight}, mult);
        let targetRect = studio.Util.multRound(
          {
            x: paddingX,
            y: paddingY,
            w: set.targetWidth || totalWidth - paddingX * 2,
            h: set.targetHeight || totalHeight - paddingY * 2
          }, mult);

        let outCtx = studio.Drawing.context(iconSize);
        let tmpCtx = studio.Drawing.context(iconSize);

        if (values[set.fieldName].ctx) {
          let srcCtx = values[set.fieldName].ctx;
          studio.Drawing.drawCenterInside(
            tmpCtx,
            srcCtx,
            targetRect,
            {x: 0, y: 0, w: srcCtx.canvas.width, h: srcCtx.canvas.height});
        }

        outCtx.drawImage(tmpCtx.canvas, 0, 0);

        this.zipper.add({
          name: `res/drawable-${density}/${set.name}.png`,
          canvas: outCtx.canvas
        });

        if (density === 'xxxhdpi') {
          this.zipper.add({
            name: `res/drawable/${set.name}.png`,
            canvas: outCtx.canvas
          });
        }

        if (set.key === 'app-icon') {
          // this.setImageForSlot_(density, outCtx.canvas.toDataURL());
        }
      });

    });

    // Old Splash Generator API < 31
    this.oldSplashSets.forEach(set => {
      ['land', 'port'].forEach(orientation => {

        const density = set.dpi;
        let mult = studio.Util.getMultBaseMdpi(density);
        let imgWidth = orientation === 'port' ? set.width : set.height;
        let imgHeight = orientation === 'port' ? set.height : set.width;

        let targetRect = studio.Util.multRound({x: 0, y: 0, w: imgWidth, h: imgHeight}, mult);
        let appIconSize = studio.Util.multRound({
          x: (imgWidth - APP_ICON_SIZE) / 2,
          y: Math.max((imgHeight - APP_ICON_SIZE - 40) / 2, 0),
          w: APP_ICON_SIZE,
          h: APP_ICON_SIZE
        }, mult);
        let brandIconSize = studio.Util.multRound({
          x: (imgWidth - BRAND_ICON_WIDTH) / 2,
          y: imgHeight - Math.round(BRAND_ICON_HEIGHT * 1.5),
          w: BRAND_ICON_WIDTH,
          h: BRAND_ICON_HEIGHT
        }, mult);


        let outCtx = studio.Drawing.context(targetRect);
        let tmpCtx = studio.Drawing.context(targetRect);

        let bgColor = values.bgColor;
        let alpha = bgColor.getAlpha();
        if (alpha > 0) {
          studio.Drawing.setBackgroundColor(tmpCtx, bgColor.toRgbString());
        }


        if (values.appIcon.ctx) {
          let srcCtx = values.appIcon.ctx;
          studio.Drawing.drawCenterInside(
            tmpCtx,
            srcCtx,
            appIconSize,
            {x: 0, y: 0, w: srcCtx.canvas.width, h: srcCtx.canvas.height});
        }

        if (values.brandIcon.ctx) {
          let srcCtx = values.brandIcon.ctx;
          studio.Drawing.drawCenterInside(
            tmpCtx,
            srcCtx,
            brandIconSize,
            {x: 0, y: 0, w: srcCtx.canvas.width, h: srcCtx.canvas.height});
        }

        outCtx.drawImage(tmpCtx.canvas, 0, 0);

        this.zipper.add({
          name: `res/drawable-${orientation}-${density}/splash.png`,
          canvas: outCtx.canvas
        });

        if (density === 'xxxhdpi') {
          this.zipper.add({
            name: `res/drawable/splash.png`,
            canvas: outCtx.canvas
          });
        }

        if (orientation === 'land') {
          this.setImageForSlot_(density, outCtx.canvas.toDataURL());
        }
      });
    });

  }
}
