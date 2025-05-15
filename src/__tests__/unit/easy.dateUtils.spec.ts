import { Event } from '../../types';
import {
  fillZero,
  formatDate,
  formatMonth,
  formatWeek,
  getDaysInMonth,
  getEventsForDay,
  getWeekDates,
  getWeeksAtMonth,
  isDateInRange,
} from '../../utils/dateUtils';

describe('getDaysInMonth', () => {
  it('1월은 31일 수를 반환한다', () => {
    expect(getDaysInMonth(2025, 1)).toBe(31);
  });

  it('4월은 30일 일수를 반환한다', () => {
    expect(getDaysInMonth(2025, 4)).toBe(30);
  });

  it('윤년의 2월에 대해 29일을 반환한다', () => {
    expect(getDaysInMonth(2024, 2)).toBe(29)
  });

  it('평년의 2월에 대해 28일을 반환한다', () => {
    expect(getDaysInMonth(2025, 2)).toBe(28)
  });

  // 12가 넘어가는 것들은 12로 나눈 몫은 연도 + n 나머지를 월로로 계산해주길 기대함
  it('유효하지 않은 월에 대해 적절히 처리한다', () => {
    expect(getDaysInMonth(2025, 13)).toBe(31)
    expect(getDaysInMonth(2025, 14)).toBe(28)
    expect(getDaysInMonth(2025, 15)).toBe(31)
    expect(getDaysInMonth(2025, 16)).toBe(30)
    expect(getDaysInMonth(2025, 17)).toBe(31)
    expect(getDaysInMonth(2025, 18)).toBe(30)
    expect(getDaysInMonth(2025, 19)).toBe(31)
    expect(getDaysInMonth(2025, 20)).toBe(31)
  });
});

describe('getWeekDates', () => {
  it('주중의 날짜(수요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const Day_20250514 = new Date(2025, 4, 14);
    expect(getWeekDates(Day_20250514)).toStrictEqual([
      new Date(2025, 4, 11),
      new Date(2025, 4, 12),
      new Date(2025, 4, 13),
      new Date(2025, 4, 14),
      new Date(2025, 4, 15),
      new Date(2025, 4, 16),
      new Date(2025, 4, 17)
    ])
  });

  it('주의 시작(월요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const Date_Monday = new Date(2025, 4, 12);
    expect(getWeekDates(Date_Monday)).toStrictEqual([
      new Date(2025, 4, 11),
      new Date(2025, 4, 12),
      new Date(2025, 4, 13),
      new Date(2025, 4, 14),
      new Date(2025, 4, 15),
      new Date(2025, 4, 16),
      new Date(2025, 4, 17)
    ])
  });

  it('주의 끝(일요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const Date_Sunday = new Date(2025, 4, 11);
    expect(getWeekDates(Date_Sunday)).toStrictEqual([
      new Date(2025, 4, 11),
      new Date(2025, 4, 12),
      new Date(2025, 4, 13),
      new Date(2025, 4, 14),
      new Date(2025, 4, 15),
      new Date(2025, 4, 16),
      new Date(2025, 4, 17)
    ])
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연말)', () => {
    const Day_20241231 = new Date(2024, 11, 31)
    expect(getWeekDates(Day_20241231)).toStrictEqual([
      new Date(2024, 11, 29),
      new Date(2024, 11, 30),
      new Date(2024, 11, 31),
      new Date(2025, 0, 1),
      new Date(2025, 0, 2),
      new Date(2025, 0, 3),
      new Date(2025, 0, 4),
    ])
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연초)', () => {
    const Day_20250101 = new Date(2025, 0, 1)
    expect(getWeekDates(Day_20250101)).toStrictEqual([
      new Date(2024, 11, 29),
      new Date(2024, 11, 30),
      new Date(2024, 11, 31),
      new Date(2025, 0, 1),
      new Date(2025, 0, 2),
      new Date(2025, 0, 3),
      new Date(2025, 0, 4),
    ])
  });

  it('윤년의 2월 29일을 포함한 주를 올바르게 처리한다', () => {
    const Day_20240229 = new Date(2024, 1, 29)
    expect(getWeekDates(Day_20240229)).toStrictEqual([
      new Date(2024, 1, 25),
      new Date(2024, 1, 26),
      new Date(2024, 1, 27),
      new Date(2024, 1, 28),
      new Date(2024, 1, 29),
      new Date(2024, 2, 1),
      new Date(2024, 2, 2),
    ])
  });

  it('월의 마지막 날짜를 포함한 주를 올바르게 처리한다', () => {
    const Day_20250430 = new Date(2025, 3, 30)
    expect(getWeekDates(Day_20250430)).toStrictEqual([
      new Date(2025, 3, 27),
      new Date(2025, 3, 28),
      new Date(2025, 3, 29),
      new Date(2025, 3, 30),
      new Date(2025, 4, 1),
      new Date(2025, 4, 2),
      new Date(2025, 4, 3),
    ])
  });
});

describe('getWeeksAtMonth', () => {
  it('2025년 7월 1일의 올바른 주 정보를 반환해야 한다', () => {
    const Day_20250701 = new Date(2025, 6, 1)
    expect(getWeeksAtMonth(Day_20250701)).toStrictEqual(
      [
        [
          null,
          null,
          1,
          2,
          3,
          4,
          5
        ],
        [
          6,
          7,
          8,
          9,
          10,
          11,
          12
        ],
        [
          13,
          14,
          15,
          16,
          17,
          18,
          19
        ],
        [
          20,
          21,
          22,
          23,
          24,
          25,
          26
        ],
        [
          27,
          28,
          29,
          30,
          31,
          null,
          null
        ]
      ]
    )
  });
});

describe('getEventsForDay', () => {
  const dummyEvent: Event[] = [{
    "id": "1",
    "title": "기존 회의",
    "date": "2025-05-01",
    "startTime": "09:00",
    "endTime": "10:00",
    "description": "기존 팀 미팅",
    "location": "회의실 B",
    "category": "업무",
    "repeat": { "type": "none", "interval": 0 },
    "notificationTime": 10
  }]

  it('특정 날짜(1일)에 해당하는 이벤트만 정확히 반환한다', () => {
    expect(getEventsForDay(dummyEvent, 1)).toStrictEqual(dummyEvent)
  });

  it('해당 날짜에 이벤트가 없을 경우 빈 배열을 반환한다', () => {
    expect(getEventsForDay(dummyEvent, 2)).toStrictEqual([])
  });

  it('날짜가 0일 경우 빈 배열을 반환한다', () => {

    expect(getEventsForDay(dummyEvent, 0)).toStrictEqual([])
  });

  it('날짜가 32일 이상인 경우 빈 배열을 반환한다', () => {

    expect(getEventsForDay(dummyEvent, 32)).toStrictEqual([])
  });
});

describe('formatWeek', () => {
  it('월의 중간 날짜에 대해 올바른 주 정보를 반환한다', () => {
    let today = new Date(2025, 4, 14);
    expect(formatWeek(today)).toBe('2025년 5월 3주')
  });

  it('월의 첫 주에 대해 올바른 주 정보를 반환한다', () => {
    let today = new Date(2025, 4, 1);
    expect(formatWeek(today)).toBe('2025년 5월 1주')
  });

  // '2025년 7월 1주'로 나오는데 이게 맞는건가? ISO 기준으로는 목요일을 기준으로 주차를 계산함
  it('월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    let today = new Date(2025, 5, 30);
    expect(formatWeek(today)).toBe('2025년 7월 1주')
  });

  it('연도가 바뀌는 주에 대해 올바른 주 정보를 반환한다', () => {
    let Day_20241231 = new Date(2024, 11, 31);
    expect(formatWeek(Day_20241231)).toBe('2025년 1월 1주')
  });

  it('윤년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    let Day_20241231 = new Date(2024, 1, 29);
    expect(formatWeek(Day_20241231)).toBe('2024년 2월 5주')
  });

  it('평년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    let Day_20241231 = new Date(2025, 1, 28);
    expect(formatWeek(Day_20241231)).toBe('2025년 2월 4주')
  });
});

describe('formatMonth', () => {
  it("2025년 7월 10일을 '2025년 7월'로 반환한다", () => {
    let Day_20250710 = new Date(2025, 6, 10);
    expect(formatMonth(Day_20250710)).toBe('2025년 7월')

  });
});

describe('isDateInRange', () => {
  const rangeStart = new Date('2025-07-01');
  const rangeEnd = new Date('2025-07-31');

  it('범위 내의 날짜 2025-07-10에 대해 true를 반환한다', () => {
    const Day_20250710 = new Date(2025, 6, 10);
    expect(isDateInRange(Day_20250710, rangeStart, rangeEnd)).toBe(true)
  });

  it('범위의 시작일 2025-07-01에 대해 true를 반환한다', () => {
    const Day_20250701 = new Date(2025, 6, 1);
    expect(isDateInRange(Day_20250701, rangeStart, rangeEnd)).toBe(true)
  });

  it('범위의 종료일 2025-07-31에 대해 true를 반환한다', () => {
    const Day_20250731 = new Date(2025, 6, 31);
    expect(isDateInRange(Day_20250731, rangeStart, rangeEnd)).toBe(true)
  });

  it('범위 이전의 날짜 2025-06-30에 대해 false를 반환한다', () => {
    const Day_20250630 = new Date(2025, 5, 30);
    expect(isDateInRange(Day_20250630, rangeStart, rangeEnd)).toBe(false)
  });

  it('범위 이후의 날짜 2025-08-01에 대해 false를 반환한다', () => {
    const Day_20250801 = new Date(2025, 7, 1);
    expect(isDateInRange(Day_20250801, rangeStart, rangeEnd)).toBe(false)
  });

  it('시작일이 종료일보다 늦은 경우 모든 날짜에 대해 false를 반환한다', () => {
    const rangeStart = new Date('2025-07-31');
    const rangeEnd = new Date('2025-07-01');
    const Day_20250710 = new Date(2025, 6, 10);
    expect(isDateInRange(Day_20250710, rangeStart, rangeEnd)).toBe(false)


    const Day_20250701 = new Date(2025, 6, 1);
    expect(isDateInRange(Day_20250701, rangeStart, rangeEnd)).toBe(false)



    const Day_20250731 = new Date(2025, 6, 31);
    expect(isDateInRange(Day_20250731, rangeStart, rangeEnd)).toBe(false)



    const Day_20250630 = new Date(2025, 5, 30);
    expect(isDateInRange(Day_20250630, rangeStart, rangeEnd)).toBe(false)



    const Day_20250801 = new Date(2025, 7, 1);
    expect(isDateInRange(Day_20250801, rangeStart, rangeEnd)).toBe(false)
  });
});

describe('fillZero', () => {
  test("5를 2자리로 변환하면 '05'를 반환한다", () => {
    expect(fillZero(5, 2)).toBe('05')
  });

  test("10을 2자리로 변환하면 '10'을 반환한다", () => {
    expect(fillZero(10, 2)).toBe('10')
  });

  test("3을 3자리로 변환하면 '003'을 반환한다", () => {
    expect(fillZero(3, 3)).toBe('003')
  });

  test("100을 2자리로 변환하면 '100'을 반환한다", () => {
    expect(fillZero(100, 2)).toBe('100')
  });

  test("0을 2자리로 변환하면 '00'을 반환한다", () => {
    expect(fillZero(0, 2)).toBe('00')
  });

  test("1을 5자리로 변환하면 '00001'을 반환한다", () => {
    expect(fillZero(1, 5)).toBe('00001')
  });

  test("소수점이 있는 3.14를 5자리로 변환하면 '03.14'를 반환한다", () => {
    expect(fillZero(3.14, 5)).toBe('03.14')
  });

  test('size 파라미터를 생략하면 기본값 2를 사용한다', () => {
    expect(fillZero(5)).toBe('05')
    expect(fillZero(10)).toBe('10')
  });

  test('value가 지정된 size보다 큰 자릿수를 가지면 원래 값을 그대로 반환한다', () => {
    expect(fillZero(10, 2)).toBe('10')
    expect(fillZero(11, 2)).toBe('11')
    expect(fillZero(100, 2)).toBe('100')
    expect(fillZero(101, 2)).toBe('101')
  });
});

describe('formatDate', () => {
  it('날짜를 YYYY-MM-DD 형식으로 포맷팅한다', () => {
    const Day_20250514 = new Date('2025-05-14')
    expect(formatDate(Day_20250514,)).toBe('2025-05-14')
  });

  it('day 파라미터가 제공되면 해당 일자로 포맷팅한다', () => {

    const Day_20250514 = new Date('2025-05-14')
    expect(formatDate(Day_20250514, 1)).toBe('2025-05-01')
    expect(formatDate(Day_20250514, 31)).toBe('2025-05-31')
  });

  it('월이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    const Day_20250514 = new Date('2025-05-14')
    expect(formatDate(Day_20250514)).toBe('2025-05-14')

    const Day_20250414 = new Date('2025-04-14')
    expect(formatDate(Day_20250414)).toBe('2025-04-14')

    const Day_20250314 = new Date('2025-03-14')
    expect(formatDate(Day_20250314)).toBe('2025-03-14')

    const Day_20250214 = new Date('2025-02-14')
    expect(formatDate(Day_20250214)).toBe('2025-02-14')
    const Day_20250114 = new Date('2025-01-14')
    expect(formatDate(Day_20250114)).toBe('2025-01-14')
  });

  it('일이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {

    const Day_20250501 = new Date('2025-05-01')
    expect(formatDate(Day_20250501)).toBe('2025-05-01')
  });
});
