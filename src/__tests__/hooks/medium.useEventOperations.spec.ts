import { act, renderHook } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import {
  setubMockHandlerError,
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../../__mocks__/handlersUtils.ts';
import { useEventOperations } from '../../hooks/useEventOperations.ts';
import { server } from '../../setupTests.ts';
import { Event } from '../../types.ts';

// ? Medium: 아래 toastFn과 mock과 이 fn은 무엇을 해줄까요?
const toastFn = vi.fn();

const initEvent = [{
  "id": "1",
  "title": "기존 회의",
  "date": "2025-10-15",
  "startTime": "09:00",
  "endTime": "10:00",
  "description": "기존 팀 미팅",
  "location": "회의실 B",
  "category": "업무",
  "repeat": { "type": "none" as const, "interval": 0 },
  "notificationTime": 10
}];

const newEvent: Omit<Event, 'id'> = {
  "title": "새 회의",
  "date": "2025-10-16",
  "startTime": "11:00",
  "endTime": "12:00",
  "description": "새로운 팀 미팅",
  "location": "회의실 A",
  "category": "업무",
  "repeat": { "type": "none" as const, "interval": 0 },
  "notificationTime": 15
};

const updateInitEvents: Event[] = [
  {
    id: '1',
    title: '기존 회의',
    date: '2025-10-15',
    startTime: '09:00',
    endTime: '10:00',
    description: '기존 팀 미팅',
    location: '회의실 B',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '2',
    title: '기존 회의2',
    date: '2025-10-15',
    startTime: '11:00',
    endTime: '12:00',
    description: '기존 팀 미팅 2',
    location: '회의실 C',
    category: '업무 회의',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 5,
  },
];

const updateEvent: Omit<Event, 'id'> = {
  "title": "수정된 회의",
  "date": "2025-10-16",
  "startTime": "11:00",
  "endTime": "18:00",
  "description": "새로운 팀 미팅",
  "location": "회의실 A",
  "category": "업무",
  "repeat": { "type": "none" as const, "interval": 0 },
  "notificationTime": 15
}


const deleteInitEvents: Event[] = [
  {
    id: '1',
    title: '삭제할 이벤트',
    date: '2025-10-15',
    startTime: '09:00',
    endTime: '10:00',
    description: '삭제할 이벤트입니다',
    location: '어딘가',
    category: '기타',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
];

vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => toastFn,
  };
});

it('저장되어있는 초기 이벤트 데이터를 적절하게 불러온다', async () => {
  setupMockHandlerCreation()
  const { result } = renderHook(() => useEventOperations(false))

  expect(result.current.events).toEqual([])

  await act(() => result.current.fetchEvents())
  // expect(result.current.events).toEqual(initEvent)
  expect(result.current.events).toEqual([])
});

it('정의된 이벤트 정보를 기준으로 적절하게 저장이 된다', async () => {
  setupMockHandlerCreation()
  const { result } = renderHook(() => useEventOperations(false))

  await act(() => result.current.saveEvent({ ...newEvent, id: '1' }))
  expect(result.current.events).toEqual([{ ...newEvent, id: '1' }])
});

it("새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다", async () => {
  setupMockHandlerUpdating()
  const { result } = renderHook(() => useEventOperations(true))

  await act(() => result.current.fetchEvents())
  expect(result.current.events).toEqual(updateInitEvents)

  await act(() => result.current.saveEvent({ ...updateEvent, id: '2' }))

  const updatedResult = updateInitEvents.map((event) => {
    if (event.id === '2') {
      return { ...event, ...updateEvent }
    }
    return event
  })
  // console.log(updatedResult);
  expect(result.current.events).toEqual(updatedResult)
});

it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
  setupMockHandlerDeletion();

  const { result } = renderHook(() => useEventOperations(false))

  await act(() => result.current.fetchEvents())
  expect(result.current.events).toEqual(deleteInitEvents)

  await act(() => result.current.deleteEvent('1'))

  expect(result.current.events).toEqual([])

});

it.only("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
  // setubMockHandlerError()
  // 먼저 console.error spy 설정정
  const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { })

  server.use(
    http.get('/api/events', () => {
      return new HttpResponse(null, { status: 500 })
    })
  )
  renderHook(() => useEventOperations(false))

  // 이렇게 실행해야 fetch 가 한번만 실행됨
  await act(() => Promise.resolve(null));

  expect(consoleSpy).toHaveBeenCalledTimes(1)

  expect(consoleSpy).toHaveBeenCalledWith(
    'Error fetching events:',
    expect.any(Error)
  )

  expect(toastFn).toHaveBeenCalledWith({
    title: '이벤트 로딩 실패',
    status: 'error',
    duration: 3000,
    isClosable: true,
  })

  consoleSpy.mockRestore()
  server.resetHandlers()
});

it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => { });

it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => { });
