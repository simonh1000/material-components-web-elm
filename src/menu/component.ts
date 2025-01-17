/**
 * @license
 * Copyright 2018 Google Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

import {MDCComponent} from '@material/base/component';
import {CustomEventListener, SpecificEventListener} from '@material/base/types';
import {MDCList, MDCListActionEvent, MDCListFoundation} from '@material/list/index';
import {MDCMenuSurfaceFoundation} from '@material/menu-surface/foundation';
import {Corner} from '@material/menu-surface/constants';
import {MDCMenuSurface, MDCMenuSurfaceFactory} from '../menu-surface/component';
import {MDCMenuDistance} from '@material/menu-surface/types';
import {MDCMenuAdapter} from '@material/menu/adapter';
import {cssClasses, strings} from '@material/menu/constants';
import {MDCMenuFoundation} from '@material/menu/foundation';
import {MDCMenuItemComponentEventDetail} from '@material/menu/types';

export type MDCMenuFactory = (el: Element, foundation?: MDCMenuFoundation) => MDCMenu;

export class MDCMenu extends MDCComponent<MDCMenuFoundation> {
  static attachTo(root: Element) {
    return new MDCMenu(root);
  }

  private menuSurfaceFactory_!: MDCMenuSurfaceFactory; // assigned in initialize()

  private menuSurface_!: MDCMenuSurface; // assigned in initialSyncWithDOM()
  private list_!: MDCList | null; // assigned in initialSyncWithDOM()

  private handleKeydown_!: SpecificEventListener<'keydown'>; // assigned in initialSyncWithDOM()
  private handleItemAction_!: CustomEventListener<MDCListActionEvent>; // assigned in initialSyncWithDOM()
  private afterOpenedCallback_!: EventListener; // assigned in initialSyncWithDOM()

  initialize(menuSurfaceFactory: MDCMenuSurfaceFactory = (el) => new MDCMenuSurface(el)) {
    this.menuSurfaceFactory_ = menuSurfaceFactory;
  }

  initialSyncWithDOM() {
    this.menuSurface_ = this.menuSurfaceFactory_(this.root_);
    if (this.list_) {
      this.list_.wrapFocus = true;
    }

    this.handleKeydown_ = (evt) => this.foundation_.handleKeydown(evt);
    this.handleItemAction_ = (evt) => this.foundation_.handleItemAction(this.items[evt.detail.index]);
    this.afterOpenedCallback_ = () => this.handleAfterOpened_();

    this.menuSurface_.listen(MDCMenuSurfaceFoundation.strings.OPENED_EVENT, this.afterOpenedCallback_);
    this.listen('keydown', this.handleKeydown_);
    this.listen(MDCListFoundation.strings.ACTION_EVENT, this.handleItemAction_);
  }

  destroy() {
    if (this.list_) {
      this.list_.destroy();
    }

    this.menuSurface_.destroy();
    this.menuSurface_.unlisten(MDCMenuSurfaceFoundation.strings.OPENED_EVENT, this.afterOpenedCallback_);
    this.unlisten('keydown', this.handleKeydown_);
    this.unlisten(MDCListFoundation.strings.ACTION_EVENT, this.handleItemAction_);
    super.destroy();
  }

  get open(): boolean {
    return this.menuSurface_.open;
  }

  set open(value: boolean) {
    this.menuSurface_.open = value;
  }

  get wrapFocus(): boolean {
    return this.list_ ? this.list_.wrapFocus : false;
  }

  set wrapFocus(value: boolean) {
    if (this.list_) {
      this.list_.wrapFocus = value;
    }
  }

  /**
   * Return the items within the menu. Note that this only contains the set of elements within
   * the items container that are proper list items, and not supplemental / presentational DOM
   * elements.
   */
  get items(): Element[] {
    return this.list_ ? this.list_.listElements : [];
  }

  set quickOpen(quickOpen: boolean) {
    this.menuSurface_.quickOpen = quickOpen;
  }

  /**
   * @param corner Default anchor corner alignment of top-left menu corner.
   */
  setAnchorCorner(corner: Corner) {
    this.menuSurface_.setAnchorCorner(corner);
  }

  setAnchorMargin(margin: Partial<MDCMenuDistance>) {
    this.menuSurface_.setAnchorMargin(margin);
  }

  /**
   * @return The item within the menu at the index specified.
   */
  getOptionByIndex(index: number): Element | null {
    const items = this.items;

    if (index < items.length) {
      return this.items[index];
    } else {
      return null;
    }
  }

  setFixedPosition(isFixed: boolean) {
    this.menuSurface_.setFixedPosition(isFixed);
  }

  hoistMenuToBody() {
    this.menuSurface_.hoistMenuToBody();
  }

  setIsHoisted(isHoisted: boolean) {
    this.menuSurface_.setIsHoisted(isHoisted);
  }

  setAbsolutePosition(x: number, y: number) {
    this.menuSurface_.setAbsolutePosition(x, y);
  }

  /**
   * Sets the element that the menu-surface is anchored to.
   */
  setAnchorElement(element: Element) {
    this.menuSurface_.anchorElement = element;
  }

  getDefaultFoundation() {
    // DO NOT INLINE this variable. For backward compatibility, foundations take a Partial<MDCFooAdapter>.
    // To ensure we don't accidentally omit any methods, we need a separate, strongly typed adapter variable.
    // tslint:disable:object-literal-sort-keys Methods should be in the same order as the adapter interface.
    const adapter: MDCMenuAdapter = {
      addClassToElementAtIndex: (index, className) => {
        const list = this.items;
        list[index].classList.add(className);
      },
      removeClassFromElementAtIndex: (index, className) => {
        const list = this.items;
        list[index].classList.remove(className);
      },
      addAttributeToElementAtIndex: (index, attr, value) => {
        const list = this.items;
        list[index].setAttribute(attr, value);
      },
      removeAttributeFromElementAtIndex: (index, attr) => {
        const list = this.items;
        list[index].removeAttribute(attr);
      },
      elementContainsClass: (element, className) => element.classList.contains(className),
      closeSurface: () => this.emit("MDCMenu:close", {}, true),
      getElementIndex: (element) => this.items.indexOf(element),
      getParentElement: (element) => element.parentElement,
      getSelectedElementIndex: (selectionGroup) => {
        const selectedListItem = selectionGroup.querySelector(`.${cssClasses.MENU_SELECTED_LIST_ITEM}`);
        return selectedListItem ? this.items.indexOf(selectedListItem) : -1;
      },
      notifySelected: (evtData) => this.emit<MDCMenuItemComponentEventDetail>(strings.SELECTED_EVENT, {
        index: evtData.index,
        item: this.items[evtData.index],
      }),
    };
    // tslint:enable:object-literal-sort-keys
    return new MDCMenuFoundation(adapter);
  }

  private handleAfterOpened_() {
    const list = this.items;
    if (list.length > 0) {
      (list[0] as HTMLElement).focus();
    }
  }
}
