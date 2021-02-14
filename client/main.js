let telemetry = [];
let flag = 'desc';

const buildHistoryQueryString = () => {
  const now = new Date();
  const end = now.getTime();
  const utcTimestamp = Date.UTC(now.getFullYear(),now.getMonth(),
    now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds(),
      now.getMilliseconds());
  const durationInMinutes = 15;
  const ms = 60 * 1000;
  const start = now.getTime() - durationInMinutes * ms;
  return `pwr.v?start=${start}&end=${end}`;
}

// console.log(buildHistoryQueryString());
const elTbody = document.getElementById('tbody');
const elThead = document.getElementById('thead');

const initialTrows = (flag) => {
  const sortedData = telemetry.sort(sortBy('timestamp', flag));
  let chunk = '';

  sortedData.map( row => (chunk+=`<tr><td>${row.id}</td>
    <td>${timeToISO(row.timestamp)}</td><td>${row.value}</td><td>
      <button type="button" class="btn btn-danger"
        data-tstamp=${row.timestamp}>Delete</button></td>
  </tr>`));

  elTbody.innerHTML = chunk;
}

const removeTelemetryRow = (item) => {
  telemetry = telemetry.filter( el => (el.timestamp.toString() !== item));
}

const initItemSelect = () => {
  elTbody.addEventListener('click', (e) => {
    let el = e.target;
    if(el && el.tagName === 'BUTTON') {
        const rowToRemove = el.getAttribute('data-tstamp');
        const parent = el.parentNode.parentNode.parentNode;
        const tr = el.parentNode.parentNode;
        removeTelemetryRow(rowToRemove);
        parent.removeChild(tr);
    }

    while (el && el.tagName !== 'TR') {
       el = el.parentNode;
    }
    el.classList.toggle('tr-selected');
  });

  elThead.addEventListener('click', (e) => {
    let el = e.target;

    if(el && el.tagName === 'I') {
      el.classList.toggle('down');
      flag = el.classList.contains('down') ? 'desc' : 'asc';
      telemetry.sort(sortBy('timestamp', flag));
      initialTrows(flag);
    }
  });
}

const getTelemetryHistory = () => {
  const urlParams = buildHistoryQueryString();
  // console.log(urlParams);
  axios.get(`/history/`,
    {params: {urlParams}})
    .then(function (response) {
      // handle success
      console.log('success', response);
      const { data } = response;
      telemetry = data.telemetry;
      initialTrows('desc');
      getRealTimeData();
      initItemSelect();
    })
    .catch(function (error) {
      // handle error
      console.log('in error', error);
    })
    .finally(function () {
      // always executed
    });
}

getTelemetryHistory();

const getRealTimeData = () => {
let socket = new WebSocket('ws://localhost:8080/realtime');
socket.onopen = function() {
  console.log('Socket open.');
  socket.send('subscribe ' + "pwr.v");
};
socket.onmessage = function(message) {
  // console.log('Socket server message', message);
  const data = JSON.parse(message.data);
  addTelemetryRow(data);
};
}

const addTelemetryRow = (updatedData) => {
const elTr = document.createElement('tr');
const elTd1 = document.createElement('td');
elTd1.innerHTML = updatedData.id;
const elTd2 = document.createElement('td');
elTd2.innerHTML = timeToISO(updatedData.timestamp);
const elTd3 = document.createElement('td');
elTd3.innerHTML = updatedData.value;
const elTd4 = document.createElement('td');
const elTd5 = document.createElement('button');
elTd5.innerText = "Delete";
elTd5.setAttribute('class','btn btn-danger');
elTd5.setAttribute('data-tstamp',updatedData.timestamp);
elTd4.appendChild(elTd5);
elTr.appendChild(elTd1);
elTr.appendChild(elTd2);
elTr.appendChild(elTd3);
elTr.appendChild(elTd4);

if (flag === 'desc') {
  //add to the top
  telemetry.unshift(updatedData);
   // not in the instructions, but the list is incremented every
   // second and will cause memory issues. removing the oldest element
   // elTbody
  telemetry.pop();
  elTbody.insertBefore(elTr, elTbody.childNodes[0]);
} else {
  //add to the bottom
  telemetry.push(updatedData);
  elTbody.appendChild(elTr);
  telemetry.pop();
}
}
