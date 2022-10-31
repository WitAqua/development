/*
 * Copyright (C) 2022 The Android Open Source Project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { CanvasDrawer } from "./canvas_drawer";

export type drawConfig = {
  fillStyle: string,
  fill: boolean
}

export class DraggableCanvasObject {
  constructor(
    private drawer: CanvasDrawer,
    private position: number,
    private definePathFunc: (ctx: CanvasRenderingContext2D, position: number) => void,
    private drawConfig: drawConfig,
    private onDrag: (x: number) => void,
    private onDrop: (x: number) => void,
  ) {
    this.drawer.handler.register(this, (x, ) => {
      this.position = x;
      this.onDrag(x);
      this.drawer.draw();
    }, (x, ) => {
      this.position = x;
      this.onDrop(x);
      this.drawer.draw();
    });
  }

  public definePath(ctx: CanvasRenderingContext2D) {
    this.definePathFunc(ctx, this.position);
  }

  public draw(ctx: CanvasRenderingContext2D) {
    this.doDraw(ctx);
    this.drawer.handler.notifyDrawnOnTop(this);
  }

  private doDraw(ctx: CanvasRenderingContext2D) {
    this.definePath(ctx);
    ctx.fillStyle = this.drawConfig.fillStyle;
    if (this.drawConfig.fill) {
      ctx.fill();
    }
  }
}