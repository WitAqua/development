/*
 * Copyright (C) 2024 The Android Open Source Project
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
import {assertDefined} from 'common/assert_utils';
import {TimestampConverterUtils} from 'test/unit/timestamp_converter_utils';
import {UnitTestUtils} from 'test/unit/utils';
import {CoarseVersion} from 'trace/coarse_version';
import {Parser} from 'trace/parser';
import {TraceType} from 'trace/trace_type';
import {PropertyTreeNode} from 'trace/tree_node/property_tree_node';

describe('Perfetto ParserMotionEvent', () => {
  let parser: Parser<PropertyTreeNode>;

  beforeAll(async () => {
    jasmine.addCustomEqualityTester(UnitTestUtils.timestampEqualityTester);
    parser = await UnitTestUtils.getPerfettoParser(
      TraceType.INPUT_MOTION_EVENT,
      'traces/perfetto/input-events.perfetto-trace',
    );
  });

  it('has expected trace type', () => {
    expect(parser.getTraceType()).toEqual(TraceType.INPUT_MOTION_EVENT);
  });

  it('has expected coarse version', () => {
    expect(parser.getCoarseVersion()).toEqual(CoarseVersion.LATEST);
  });

  it('provides timestamps', () => {
    const timestamps = assertDefined(parser.getTimestamps());

    expect(timestamps.length).toEqual(4);

    const expected = [
      TimestampConverterUtils.makeRealTimestamp(1718163696245804410n),
      TimestampConverterUtils.makeRealTimestamp(1718163696254923410n),
      TimestampConverterUtils.makeRealTimestamp(1718163696262592410n),
      TimestampConverterUtils.makeRealTimestamp(1718163696271081410n),
    ];
    expect(timestamps).toEqual(expected);
  });

  it('retrieves trace entry from timestamp', async () => {
    const entry = await parser.getEntry(1);
    expect(entry.id).toEqual('AndroidMotionEvent entry');
  });

  it('transforms fake motion event proto built from trace processor args', async () => {
    const entry = await parser.getEntry(0);
    const motionEvent = assertDefined(entry.getChildByName('motionEvent'));

    expect(motionEvent?.getChildByName('eventId')?.getValue()).toEqual(
      856299947,
    );
    expect(motionEvent?.getChildByName('action')?.formattedValue()).toEqual(
      'ACTION_DOWN',
    );
    expect(motionEvent?.getChildByName('source')?.formattedValue()).toEqual(
      'SOURCE_TOUCHSCREEN',
    );
    expect(motionEvent?.getChildByName('flags')?.formattedValue()).toEqual(
      '128',
    );
    expect(motionEvent?.getChildByName('deviceId')?.getValue()).toEqual(4);
    expect(motionEvent?.getChildByName('displayId')?.getValue()).toEqual(0);
    expect(
      motionEvent?.getChildByName('classification')?.formattedValue(),
    ).toEqual('CLASSIFICATION_NONE');
    expect(motionEvent?.getChildByName('cursorPositionX')?.getValue()).toEqual(
      null,
    );
    expect(motionEvent?.getChildByName('cursorPositionY')?.getValue()).toEqual(
      null,
    );
    expect(motionEvent?.getChildByName('metaState')?.formattedValue()).toEqual(
      '0',
    );

    const firstPointer = motionEvent
      ?.getChildByName('pointer')
      ?.getChildByName('0');

    expect(firstPointer?.getChildByName('pointerId')?.getValue()).toEqual(0);

    expect(firstPointer?.getChildByName('toolType')?.formattedValue()).toEqual(
      'TOOL_TYPE_FINGER',
    );

    expect(
      firstPointer
        ?.getChildByName('axisValue')
        ?.getChildByName('0')
        ?.getChildByName('axis')
        ?.formattedValue(),
    ).toEqual('AXIS_X');

    expect(
      firstPointer
        ?.getChildByName('axisValue')
        ?.getChildByName('0')
        ?.getChildByName('value')
        ?.getValue(),
    ).toEqual(350);

    expect(
      firstPointer
        ?.getChildByName('axisValue')
        ?.getChildByName('1')
        ?.getChildByName('axis')
        ?.formattedValue(),
    ).toEqual('AXIS_Y');

    expect(
      firstPointer
        ?.getChildByName('axisValue')
        ?.getChildByName('1')
        ?.getChildByName('value')
        ?.getValue(),
    ).toEqual(370);
  });

  it('merges motion event with all associated dispatch events', async () => {
    const entry = await parser.getEntry(0);
    const windowDispatchEvents = assertDefined(
      entry.getChildByName('windowDispatchEvents'),
    );

    expect(windowDispatchEvents?.getAllChildren().length).toEqual(6);
    expect(
      windowDispatchEvents
        ?.getChildByName('0')
        ?.getChildByName('windowId')
        ?.getValue(),
    ).toEqual(BigInt(292));
    expect(
      windowDispatchEvents
        ?.getChildByName('1')
        ?.getChildByName('windowId')
        ?.getValue(),
    ).toEqual(BigInt(247));
    expect(
      windowDispatchEvents
        ?.getChildByName('2')
        ?.getChildByName('windowId')
        ?.getValue(),
    ).toEqual(BigInt(240));
    expect(
      windowDispatchEvents
        ?.getChildByName('3')
        ?.getChildByName('windowId')
        ?.getValue(),
    ).toEqual(BigInt(370));
    expect(
      windowDispatchEvents
        ?.getChildByName('4')
        ?.getChildByName('windowId')
        ?.getValue(),
    ).toEqual(BigInt(229));
    expect(
      windowDispatchEvents
        ?.getChildByName('5')
        ?.getChildByName('windowId')
        ?.getValue(),
    ).toEqual(BigInt(0));
  });
});
