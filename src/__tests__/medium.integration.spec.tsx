import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, within, act, fireEvent, findByRole } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { ReactElement } from 'react';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../__mocks__/handlersUtils';
import App from '../App';
import { server } from '../setupTests';
import { Event } from '../types';

const initEvent = [
  {
    id: '1',
    title: '기존 회의',
    date: '2025-10-15',
    startTime: '09:00',
    endTime: '10:00',
    description: '기존 팀 미팅',
    location: '회의실 B',
    category: '업무',
    repeat: { type: 'none' as const, interval: 0 },
    notificationTime: 10
  }
]

const initEvents = [
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
]

const newEvent = {
  id: '1', // Adding the required id property
  title: 'title',
  date: '2025-05-16',
  startTime: '00:00',
  endTime: '00:00',
  location: 'location',
  description: 'description',
  category: '업무', // App.tsx에 정의된 유효한 카테고리 값 중 하나 사용
  repeat: { type: 'none' as const, interval: 0 },
  notificationTime: 10
}

const saveSchedule = async (
  user: UserEvent,
  form: Omit<Event, 'id' | 'notificationTime' | 'repeat'>
) => {
  const { title, date, startTime, endTime, location, description, category } = form;

  await user.click(screen.getAllByText('일정 추가')[0]);

  await user.type(screen.getByLabelText('제목'), title);
  await user.type(screen.getByLabelText('날짜'), date);
  await user.type(screen.getByLabelText('시작 시간'), startTime);
  await user.type(screen.getByLabelText('종료 시간'), endTime);
  await user.type(screen.getByLabelText('설명'), description);
  await user.type(screen.getByLabelText('위치'), location);
  await user.selectOptions(screen.getByLabelText('카테고리'), category);

  await user.click(screen.getByTestId('event-submit-button'));
};

const updateSchedule = async (user: UserEvent, form: Omit<Event, 'notificationTime' | 'repeat'>) => {

  const { title, date, startTime, endTime, location, description, category } = form;
  await user.type(screen.getByLabelText('제목'), title);
  await user.type(screen.getByLabelText('날짜'), date);
  await user.type(screen.getByLabelText('시작 시간'), startTime);
  await user.type(screen.getByLabelText('종료 시간'), endTime);
  await user.type(screen.getByLabelText('설명'), description);
  await user.type(screen.getByLabelText('위치'), location);
  await user.selectOptions(screen.getByLabelText('카테고리'), category);

  await user.click(screen.getByTestId('event-submit-button'));
}

// ! HINT. "검색 결과가 없습니다"는 초기에 노출되는데요. 그럼 검증하고자 하는 액션이 실행되기 전에 검증해버리지 않을까요? 이 테스트를 신뢰성있게 만드려면 어떻게 할까요?
describe.only('일정 CRUD 및 기본 기능', () => {
  it('mock 핸들러 check', async () => {
    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events: initEvent })
      })
    )

    render(<ChakraProvider><App /></ChakraProvider>);
    const eventList = within(screen.getByTestId('event-list'));
    expect(await eventList.findByText('기존 회의')).toBeInTheDocument();
  })


  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    // ! HINT. event를 추가 제거하고 저장하는 로직을 잘 살펴보고, 만약 그대로 구현한다면 어떤 문제가 있을 지 고민해보세요.
    // 테스트 전에 mock 핸들러 설정
    setupMockHandlerCreation();

    render(<ChakraProvider><App /></ChakraProvider>);

    const user = userEvent.setup();

    await saveSchedule(user, {
      title: '새 회의',
      date: '2025-10-15',
      startTime: '14:00',
      endTime: '15:00',
      description: '프로젝트 진행 상황 논의',
      location: '회의실 A',
      category: '업무',
    });

    const eventList = within(screen.getByTestId('event-list'));
    expect(eventList.getByText('새 회의')).toBeInTheDocument();

  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    // setupMockHandlerUpdating();
    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events: initEvents })
      }),
      http.put('/api/events/:id', async ({ params, request }) => {
        const { id } = params;
        const updatedEvent = (await request.json()) as Event;
        const index = initEvents.findIndex((event) => event.id === id)

        initEvents[index] = { ...initEvents[index], ...updatedEvent }
        return HttpResponse.json(initEvents[index]);
      })
    )

    // 렌더링
    render(<ChakraProvider><App /></ChakraProvider>);
    const user = userEvent.setup();

    // fetch 확인
    const eventList = within(screen.getByTestId('event-list'))
    expect(await eventList.findByText('기존 회의2')).toBeInTheDocument()

    // 유저 이벤트로 2번째 수정 버튼 클릭
    const editBtn = await screen.findAllByRole('button', { name: 'Edit event' })
    await user.click(editBtn[1])

    await user.clear(screen.getByLabelText('제목'))
    await user.type(screen.getByLabelText('제목'), '수정된 회의')

    await user.click(screen.getByTestId('event-submit-button'));

    expect(await eventList.findByText('수정된 회의')).toBeInTheDocument()
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    // api setup
    setupMockHandlerDeletion()

    // 렌더링
    render(<ChakraProvider><App /></ChakraProvider>);
    const user = userEvent.setup();

    const eventList = within(screen.getByTestId('event-list'))

    // fetch 확인
    expect(await eventList.findByText('삭제할 이벤트')).toBeInTheDocument()
    const deleteBtn = await eventList.findByRole('button', { name: 'Delete event' })

    // 삭제 버튼 클릭
    await user.click(deleteBtn)

    expect(eventList.findByText('검색 결과가 없습니다.'))
  });

  // describe('일정 뷰', () => {
  //   it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => { });

  //   it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => { });

  //   it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => { });

  //   it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => { });

  //   it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => { });
  // });

  // describe('검색 기능', () => {
  //   it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => { });

  //   it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => { });

  //   it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => { });
  // });

  // describe('일정 충돌', () => {
  //   it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => { });

  //   it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => { });
  // });

  // it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => { });

  // describe('일', () => {
  //   it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async => { });

  //   it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async => { });

  //   it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async => { });

  //   it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async => { });

  //   it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', asyn) => );
  // });

  // describe('검색', () => {
  //   it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async => { });

  //   it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async => { });

  //   it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', asyn) => );
  // });

  // describe('일정', () => {
  //   it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async => { });

  //   it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', asyn) => );
  // });

  // it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => { });
});