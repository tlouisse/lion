const html = strings => strings[0];

export default html`
  <div id="content">
    <table
      aria-labelledby="month_and_year"
      aria-readonly="true"
      class="calendar__grid"
      data-wrap-cols=""
      role="grid"
    >
      <thead id="calendar__thead">
        <tr role="row">
          <th
            class="calendar__weekday-header"
            aria-label="Sunday"
            id="weekday1"
            scope="col"
            role="columnheader"
          >
            Sun
          </th>
          <th
            class="calendar__weekday-header"
            aria-label="Monday"
            id="weekday2"
            scope="col"
            role="columnheader"
          >
            Mon
          </th>
          <th
            class="calendar__weekday-header"
            aria-label="Tuesday"
            id="weekday3"
            scope="col"
            role="columnheader"
          >
            Tue
          </th>
          <th
            class="calendar__weekday-header"
            aria-label="Wednesday"
            id="weekday4"
            scope="col"
            role="columnheader"
          >
            Wed
          </th>
          <th
            class="calendar__weekday-header"
            aria-label="Thursday"
            id="weekday5"
            scope="col"
            role="columnheader"
          >
            Thu
          </th>
          <th
            class="calendar__weekday-header"
            aria-label="Friday"
            id="weekday6"
            scope="col"
            role="columnheader"
          >
            Fri
          </th>
          <th
            class="calendar__weekday-header"
            aria-label="Saturday"
            id="weekday7"
            scope="col"
            role="columnheader"
          >
            Sat
          </th>
        </tr>
      </thead>
      <tbody>
        <tr role="row">
          <td class="calendar__day-cell" role="gridcell">
            <button
              aria-label="25 November 2018 Sunday"
              aria-selected="false"
              class="calendar__day-button"
              tabindex="-1"
            >
              25
            </button>
          </td>
          <td class="calendar__day-cell" role="gridcell">
            <button
              aria-label="26 November 2018 Monday"
              aria-selected="false"
              class="calendar__day-button"
              tabindex="-1"
            >
              26
            </button>
          </td>
          <td class="calendar__day-cell" role="gridcell">
            <button
              aria-label="27 November 2018 Tuesday"
              aria-selected="false"
              class="calendar__day-button"
              tabindex="-1"
            >
              27
            </button>
          </td>
          <td class="calendar__day-cell" role="gridcell">
            <button
              aria-label="28 November 2018 Wednesday"
              aria-selected="false"
              class="calendar__day-button"
              tabindex="-1"
            >
              28
            </button>
          </td>
          <td class="calendar__day-cell" role="gridcell">
            <button
              aria-label="29 November 2018 Thursday"
              aria-selected="false"
              class="calendar__day-button"
              tabindex="-1"
            >
              29
            </button>
          </td>
          <td class="calendar__day-cell" role="gridcell">
            <button
              aria-label="30 November 2018 Friday"
              aria-selected="false"
              class="calendar__day-button"
              tabindex="-1"
            >
              30
            </button>
          </td>
          <td class="calendar__day-cell" role="gridcell">
            <button
              aria-label="1 December 2018 Saturday"
              aria-selected="false"
              class="calendar__day-button"
              tabindex="-1"
            >
              1
            </button>
          </td>
        </tr>
        <tr role="row">
          <td class="calendar__day-cell" role="gridcell">
            <button
              aria-label="2 December 2018 Sunday"
              aria-selected="false"
              class="calendar__day-button"
              tabindex="-1"
            >
              2
            </button>
          </td>
          <td class="calendar__day-cell" role="gridcell">
            <button
              aria-label="3 December 2018 Monday"
              aria-selected="false"
              class="calendar__day-button"
              tabindex="-1"
            >
              3
            </button>
          </td>
          <td class="calendar__day-cell" role="gridcell">
            <button
              aria-label="4 December 2018 Tuesday"
              aria-selected="false"
              class="calendar__day-button"
              tabindex="-1"
            >
              4
            </button>
          </td>
          <td class="calendar__day-cell" role="gridcell">
            <button
              aria-label="5 December 2018 Wednesday"
              aria-selected="false"
              class="calendar__day-button"
              tabindex="-1"
            >
              5
            </button>
          </td>
          <td class="calendar__day-cell" role="gridcell">
            <button
              aria-label="6 December 2018 Thursday"
              aria-selected="false"
              class="calendar__day-button"
              tabindex="-1"
            >
              6
            </button>
          </td>
          <td class="calendar__day-cell" role="gridcell">
            <button
              aria-label="7 December 2018 Friday"
              aria-selected="false"
              class="calendar__day-button"
              tabindex="-1"
            >
              7
            </button>
          </td>
          <td class="calendar__day-cell" role="gridcell">
            <button
              aria-label="8 December 2018 Saturday"
              aria-selected="false"
              class="calendar__day-button"
              tabindex="-1"
            >
              8
            </button>
          </td>
        </tr>
        <tr role="row">
          <td class="calendar__day-cell" role="gridcell">
            <button
              aria-label="9 December 2018 Sunday"
              aria-selected="false"
              class="calendar__day-button"
              tabindex="-1"
            >
              9
            </button>
          </td>
          <td class="calendar__day-cell" role="gridcell">
            <button
              aria-label="10 December 2018 Monday"
              aria-selected="false"
              class="calendar__day-button"
              tabindex="-1"
            >
              10
            </button>
          </td>
          <td class="calendar__day-cell" role="gridcell">
            <button
              aria-label="11 December 2018 Tuesday"
              aria-selected="false"
              class="calendar__day-button"
              tabindex="-1"
            >
              11
            </button>
          </td>
          <td class="calendar__day-cell" role="gridcell">
            <button
              aria-label="12 December 2018 Wednesday"
              aria-selected="false"
              class="calendar__day-button"
              tabindex="-1"
            >
              12
            </button>
          </td>
          <td class="calendar__day-cell" role="gridcell">
            <button
              aria-label="13 December 2018 Thursday"
              aria-selected="false"
              class="calendar__day-button"
              tabindex="-1"
            >
              13
            </button>
          </td>
          <td class="calendar__day-cell" role="gridcell">
            <button
              aria-label="14 December 2018 Friday"
              aria-selected="false"
              class="calendar__day-button"
              tabindex="-1"
            >
              14
            </button>
          </td>
          <td class="calendar__day-cell" role="gridcell">
            <button
              aria-label="15 December 2018 Saturday"
              aria-selected="false"
              class="calendar__day-button"
              tabindex="-1"
            >
              15
            </button>
          </td>
        </tr>
        <tr role="row">
          <td class="calendar__day-cell" role="gridcell">
            <button
              aria-label="16 December 2018 Sunday"
              aria-selected="false"
              class="calendar__day-button"
              tabindex="-1"
            >
              16
            </button>
          </td>
          <td class="calendar__day-cell" role="gridcell">
            <button
              aria-label="17 December 2018 Monday"
              aria-selected="false"
              class="calendar__day-button"
              tabindex="-1"
            >
              17
            </button>
          </td>
          <td class="calendar__day-cell" role="gridcell">
            <button
              aria-label="18 December 2018 Tuesday"
              aria-selected="false"
              class="calendar__day-button"
              tabindex="-1"
            >
              18
            </button>
          </td>
          <td class="calendar__day-cell" role="gridcell">
            <button
              aria-label="19 December 2018 Wednesday"
              aria-selected="false"
              class="calendar__day-button"
              tabindex="-1"
            >
              19
            </button>
          </td>
          <td class="calendar__day-cell" role="gridcell">
            <button
              aria-label="20 December 2018 Thursday"
              aria-selected="false"
              class="calendar__day-button"
              tabindex="-1"
            >
              20
            </button>
          </td>
          <td class="calendar__day-cell" role="gridcell">
            <button
              aria-label="21 December 2018 Friday"
              aria-selected="false"
              class="calendar__day-button"
              tabindex="-1"
            >
              21
            </button>
          </td>
          <td class="calendar__day-cell" role="gridcell">
            <button
              aria-label="22 December 2018 Saturday"
              aria-selected="false"
              class="calendar__day-button"
              tabindex="-1"
            >
              22
            </button>
          </td>
        </tr>
        <tr role="row">
          <td class="calendar__day-cell" role="gridcell">
            <button
              aria-label="23 December 2018 Sunday"
              aria-selected="false"
              class="calendar__day-button"
              tabindex="-1"
            >
              23
            </button>
          </td>
          <td class="calendar__day-cell" role="gridcell">
            <button
              aria-label="24 December 2018 Monday"
              aria-selected="false"
              class="calendar__day-button"
              tabindex="-1"
            >
              24
            </button>
          </td>
          <td class="calendar__day-cell" role="gridcell">
            <button
              aria-label="25 December 2018 Tuesday"
              aria-selected="false"
              class="calendar__day-button"
              tabindex="-1"
            >
              25
            </button>
          </td>
          <td class="calendar__day-cell" role="gridcell">
            <button
              aria-label="26 December 2018 Wednesday"
              aria-selected="false"
              class="calendar__day-button"
              tabindex="-1"
            >
              26
            </button>
          </td>
          <td class="calendar__day-cell" role="gridcell">
            <button
              aria-label="27 December 2018 Thursday"
              aria-selected="false"
              class="calendar__day-button"
              tabindex="-1"
            >
              27
            </button>
          </td>
          <td class="calendar__day-cell" role="gridcell">
            <button
              aria-label="28 December 2018 Friday"
              aria-selected="false"
              class="calendar__day-button"
              tabindex="-1"
            >
              28
            </button>
          </td>
          <td class="calendar__day-cell" role="gridcell">
            <button
              aria-label="29 December 2018 Saturday"
              aria-selected="false"
              class="calendar__day-button"
              tabindex="-1"
            >
              29
            </button>
          </td>
        </tr>
        <tr role="row">
          <td class="calendar__day-cell" role="gridcell">
            <button
              aria-label="30 December 2018 Sunday"
              aria-selected="false"
              class="calendar__day-button"
              tabindex="-1"
            >
              30
            </button>
          </td>
          <td class="calendar__day-cell" role="gridcell">
            <button
              aria-label="31 December 2018 Monday"
              aria-selected="false"
              class="calendar__day-button"
              tabindex="-1"
            >
              31
            </button>
          </td>
          <td class="calendar__day-cell" role="gridcell">
            <button
              aria-label="1 January 2019 Tuesday"
              aria-selected="false"
              class="calendar__day-button"
              tabindex="-1"
            >
              1
            </button>
          </td>
          <td class="calendar__day-cell" role="gridcell">
            <button
              aria-label="2 January 2019 Wednesday"
              aria-selected="false"
              class="calendar__day-button"
              tabindex="-1"
            >
              2
            </button>
          </td>
          <td class="calendar__day-cell" role="gridcell">
            <button
              aria-label="3 January 2019 Thursday"
              aria-selected="false"
              class="calendar__day-button"
              tabindex="-1"
            >
              3
            </button>
          </td>
          <td class="calendar__day-cell" role="gridcell">
            <button
              aria-label="4 January 2019 Friday"
              aria-selected="false"
              class="calendar__day-button"
              tabindex="-1"
            >
              4
            </button>
          </td>
          <td class="calendar__day-cell" role="gridcell">
            <button
              aria-label="5 January 2019 Saturday"
              aria-selected="false"
              class="calendar__day-button"
              tabindex="-1"
            >
              5
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
`;
