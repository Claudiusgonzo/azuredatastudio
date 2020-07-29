/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IView, ScrollableView } from 'sql/base/browser/ui/scrollableView/scrollableView';
import { Emitter } from 'vs/base/common/event';
import * as assert from 'assert';
import { Disposable } from 'vs/base/common/lifecycle';
import { timeout } from 'vs/base/common/async';

class TestView extends Disposable implements IView {

	constructor(public minimumSize: number, public maximumSize: number) { super(); }

	private readonly _onDidLayout = this._register(new Emitter<{ height: number, width: number }>());
	public readonly onDidLayout = this._onDidLayout.event;
	layout(height: number, width: number): void {
		this._size = height;
		this._onDidLayout.fire({ height, width });
	}

	private _size: number;
	public get size(): number {
		return this._size;
	}

	public readonly onDidChangeEmitter = this._register(new Emitter<number>());
	public readonly onDidChange = this.onDidChangeEmitter.event;

	public readonly element = document.createElement('div');

	private readonly _onDidInsertEmitter = this._register(new Emitter<void>());
	public readonly onDidInsertEvent = this._onDidInsertEmitter.event;
	onDidInsert?(): void {
		this._onDidInsertEmitter.fire();
	}

	private readonly _onDidRemoveEmitter = this._register(new Emitter<void>());
	public readonly onDidRemoveEvent = this._onDidRemoveEmitter.event;
	onDidRemove?(): void {
		this._onDidRemoveEmitter.fire();
	}


}

suite('Scrollableview', () => {
	let container: HTMLElement;

	setup(() => {
		container = document.createElement('div');
		container.style.position = 'absolute';
		container.style.width = `${200}px`;
		container.style.height = `${200}px`;
	});

	test('creates empty view', () => {
		const scrollableView = new ScrollableView(container);
		scrollableView.layout(200, 200);
		assert.equal(container.firstElementChild!.firstElementChild!.firstElementChild!.childElementCount, 0, 'view should be empty');
		scrollableView.dispose();
	});

	test('adds and removes views correctly', async () => {
		const view1 = new TestView(20, 20);
		const view2 = new TestView(20, 20);
		const view3 = new TestView(20, 20);
		const scrollableView = new ScrollableView(container);

		scrollableView.layout(200, 200);

		scrollableView.addView(view1);
		scrollableView.addView(view2);
		scrollableView.addView(view3);

		// we only update the scroll dimensions asynchronously
		await timeout(100);

		let viewQuery = getViewChildren(container);
		assert.equal(viewQuery.length, 3, 'split view should have 3 views');

		scrollableView.removeView(2);

		viewQuery = getViewChildren(container);
		assert.equal(viewQuery.length, 2, 'split view should have 2 views');

		scrollableView.removeView(0);

		viewQuery = getViewChildren(container);
		assert.equal(viewQuery.length, 1, 'split view should have 1 views');

		scrollableView.removeView(0);

		viewQuery = getViewChildren(container);
		assert.equal(viewQuery.length, 0, 'split view should have no views');

		scrollableView.addViews([view1, view2, view3]);

		viewQuery = getViewChildren(container);
		assert.equal(viewQuery.length, 3, 'split view should have 3 views');

		scrollableView.clear();

		viewQuery = getViewChildren(container);
		assert.equal(viewQuery.length, 0, 'split view should have no views');

		view1.dispose();
		view2.dispose();
		view3.dispose();
		scrollableView.dispose();
	});

	test('does shrink views correctly', async () => {
		const view1 = new TestView(20, Number.POSITIVE_INFINITY);
		const view2 = new TestView(20, Number.POSITIVE_INFINITY);
		const view3 = new TestView(20, Number.POSITIVE_INFINITY);
		const scrollableView = new ScrollableView(container);

		scrollableView.layout(200, 200);

		scrollableView.addView(view1);

		await timeout(100);

		assert.equal(view1.size, 200, 'view1 is entire size');

		scrollableView.addView(view2);

		await timeout(100);

		assert.equal(view1.size, 100, 'view1 is half size');
		assert.equal(view2.size, 100, 'view2 is half size');

		scrollableView.addView(view3);

		await timeout(100);

		assert.equal(view1.size, 66, 'view1 is third size');
		assert.equal(view2.size, 67, 'view2 is third size');
		assert.equal(view3.size, 67, 'view3 is third size');
	});

	test('does honor minimum size', async () => {
		const view1 = new TestView(100, Number.POSITIVE_INFINITY);
		const view2 = new TestView(100, Number.POSITIVE_INFINITY);
		const view3 = new TestView(100, Number.POSITIVE_INFINITY);
		const scrollableView = new ScrollableView(container);

		scrollableView.layout(200, 200);

		scrollableView.addViews([view1, view2, view3]);

		await timeout(100);

		assert.equal(view1.size, 100, 'view1 is minimum size');
		assert.equal(view2.size, 100, 'view2 is minimum size');
		assert.equal(view3.size, undefined, 'view3 should not have been layout yet');
	});

	test('does react to changes in views', async () => {
		const view1 = new TestView(100, Number.POSITIVE_INFINITY);
		const view2 = new TestView(100, Number.POSITIVE_INFINITY);
		const view3 = new TestView(100, Number.POSITIVE_INFINITY);
		const scrollableView = new ScrollableView(container);

		scrollableView.layout(200, 200);

		scrollableView.addViews([view1, view2, view3]);

		await timeout(100);

		view1.minimumSize = 130;
		view1.onDidChangeEmitter.fire(0);

		await timeout(100);

		assert.equal(view1.size, 130, 'view1 should be 130');
		assert.equal(view2.size, 100, 'view2 should still be minimum size');
		assert.equal(view3.size, undefined, 'view3 should not have been layout yet');
	});

	test('dose programmatically scroll', async () => {
		const view1 = new TestView(100, Number.POSITIVE_INFINITY);
		const view2 = new TestView(100, Number.POSITIVE_INFINITY);
		const view3 = new TestView(100, Number.POSITIVE_INFINITY);
		const scrollableView = new ScrollableView(container);

		scrollableView.layout(200, 200);

		scrollableView.addViews([view1, view2, view3]);

		await timeout(100);

		assert.equal(view1.size, 100, 'view1 is minimum size');
		assert.equal(view2.size, 100, 'view2 is minimum size');
		assert.equal(view3.size, undefined, 'view3 should not have been layout yet');
		assert.equal(getViewChildren(container).length, 2, 'only 2 views are rendered');

		scrollableView.setScrollTop(100);

		await timeout(100);
		assert.equal(view2.size, 100, 'view2 is minimum size');
		assert.equal(view3.size, 100, 'view3 is minimum size');
		assert.equal(getViewChildren(container).length, 2, 'only 2 views are rendered');
	});
});

function getViewChildren(container: HTMLElement): NodeListOf<Element> {
	return container.querySelectorAll('.scrollable-view .scrollable-view-container > .scrollable-view-child');
}
