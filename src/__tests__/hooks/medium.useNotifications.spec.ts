import { act, renderHook } from '@testing-library/react';
import * as React from 'react';

import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event } from '../../types.ts';
import { parseHM } from '../utils.ts';
import { formatDate } from '../../utils/dateUtils.ts';

// Mock the useInterval hook to avoid actual timer calls

describe('useNotifications', () => {
  const initEvent = [{
    "id": "1",
    "title": "기존 회의",
    "date": "2025-05-23",
    "startTime": "17:50",
    "endTime": "23:00",
    "description": "기존 팀 미팅",
    "location": "회의실 B",
    "category": "업무",
    "repeat": { "type": "none" as const, "interval": 0 },
    "notificationTime": 120
  }];

  it('초기 상태에서는 알림이 없어야 한다', () => {
    const { result } = renderHook(() => useNotifications(initEvent));
    expect(result.current.notifications).toEqual([]);
  });

  it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', () => {
    const notificationTime = 5;
    const mockEvents: Event[] = [
      {
        id: 1,
        title: '테스트 이벤트',
        date: formatDate(new Date()),
        startTime: parseHM(Date.now() + 10 * 60 * 1000),
        endTime: parseHM(Date.now() + 20 * 60 * 1000),
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 0 },
        notificationTime,
      },
    ];

    const { result } = renderHook(() => useNotifications(mockEvents));

    expect(result.current.notifications).toHaveLength(0);

    vi.setSystemTime(new Date(Date.now() + notificationTime * 60 * 1000))

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifiedEvents).toContain(1);
  });

  it('index를 기준으로 알림을 적절하게 제거할 수 있다', () => { });

  it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', () => { });
})
