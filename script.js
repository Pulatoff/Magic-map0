'use strict';

// prettier-ignore

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

let lat;
let lon;
let map;
let eventMap;

class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-8);
  constructor(distance, coodrs, duration) {
    (this.distance = distance),
      (this.coodrs = coodrs),
      (this.duration = duration);
  }
  setTavsif() {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    this.tavsif = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }
}

class Run extends Workout {
  type = 'running';
  constructor(distance, coodrs, duration, cadence) {
    super(distance, coodrs, duration);
    this.cadence = cadence;
    this.setTavsif();
  }
}

class Cylcing extends Workout {
  type = 'cycling';
  constructor(distance, coodrs, duration, elevation) {
    super(distance, coodrs, duration);
    this.elevation = elevation;
    this.setTavsif();
  }
}

class App {
  #mashqlar = [];
  constructor() {
    this.getCurrentPosition();
    form.addEventListener('submit', this.createObj.bind(this));

    inputType.addEventListener('change', this.selectToogle);
    containerWorkouts.addEventListener('click', this.moveCenter.bind(this));
  }

  // Geolocation olish
  getCurrentPosition() {
    navigator.geolocation.getCurrentPosition(
      this.showMap.bind(this),
      function () {
        alert(`Hech nma`);
      }
    );
  }

  // Mapni chiqarish
  showMap(position) {
    map = L.map('map').setView([40.00450459806069, 66.23921155929567], 15);
    lat = 40.00450459806069;
    lon = 66.23921155929567;
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(
      map
    );
    this.showForm();
    this.getLocalStorage();
  }
  // Formani ochish
  showForm() {
    map.on('click', function (e) {
      eventMap = e;
      form.classList.remove('hidden');
      inputDistance.focus();
      L.Routing.control({
        waypoints: [L.latLng(lat, lon), L.latLng(lat + 0.5, lon + 0.5)],
        lineOptions: {
          styles: [{ color: 'blue', opacity: 1, weight: 5 }],
        },
      })
        .on('routesfound', function (e) {
          console.log(e.routes[0].summary.totalDistance);
          // console.log(route.summary.totalDistance);
        })
        .addTo(map);
      let btn = document.querySelector('.leaflet-routing-container');
      btn.addEventListener('click', function () {
        btn.classList.toggle('leaflet-routing-container-hide');
      });
    });
  }
  // Formadan submit qilish
  setForm(obj) {
    L.marker([...obj.coodrs], {
      opacity: 1,
      draggable: false,
    })
      .addTo(map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 50,
          autoClose: false,
          closeOnClick: false,
          className: 'running-popup',
        }).setContent(`<p>🏃‍♂️ ${obj.tavsif} </p>`)
      )
      .openPopup();
    this.formClose();
  }
  selectToogle(e) {
    e.preventDefault();
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
  }
  formClose() {
    inputCadence.value = '';
    inputDistance.value = '';
    inputDuration.value = '';
    inputElevation.value = '';
    form.classList.add('hidden');
  }
  // formadan malumotlarni uqib object yaratish;

  createObj(e) {
    e.preventDefault();
    let mashq;
    let numbermi = (...inputs) => {
      return inputs.every(val => Number.isFinite(val));
    };
    let musbatmi = (...inputs) => {
      return inputs.every(val => val > 0);
    };

    let distance = +inputDistance.value;
    let duration = +inputDuration.value;
    let type = inputType.value;
    if (type == 'running') {
      let cadence = +inputCadence.value;
      if (
        !numbermi(distance, duration, cadence) ||
        !musbatmi(distance, duration, cadence)
      ) {
        return alert('xato qayta urinib kurin');
      }
      mashq = new Run(
        distance,
        [eventMap.latlng.lat, eventMap.latlng.lng],
        duration,
        cadence
      );
    } else {
      let elevation = +inputElevation.value;
      if (
        !numbermi(distance, duration, elevation) ||
        !musbatmi(distance, duration)
      ) {
        return alert('xato qayta urinib kurin');
      }
      mashq = new Cylcing(
        distance,
        [eventMap.latlng.lat, eventMap.latlng.lng],
        duration,
        elevation
      );
    }

    this.setForm(mashq);
    this.#mashqlar.push(mashq);
    this.renderList(mashq);
    this.setLocalStorage();
  }

  renderList(obj) {
    let html = `<li class="workout workout--${obj.type}" data-id="${obj.id}">
    <h2 class="workout__title">${obj.tavsif}</h2>
    <div class="workout__details">
      <span class="workout__icon">${obj.type === 'running' ? '🏃‍♂️' : '🚴‍♂️'}</span>
      <span class="workout__value">${obj.distance}</span>
      <span class="workout__unit">km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⏱</span>
      <span class="workout__value">${obj.duration}</span>
      <span class="workout__unit">min</span>
    </div>`;
    if (obj.type == 'running') {
      html += ` <div class="workout__details">
      <span class="workout__icon">⚡️</span>
      <span class="workout__value">${obj.distance / obj.duration}</span>
      <span class="workout__unit">km/min</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">🦶🏼</span>
      <span class="workout__value">${obj.cadence}</span>
      <span class="workout__unit">spm</span>
    </div>
  </li>
`;
    } else {
      html += ` <div class="workout__details">
      <span class="workout__icon">⚡️</span>
      <span class="workout__value">${obj.distance / obj.duration}</span>
      <span class="workout__unit">km/min</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">🦶🏼</span>
      <span class="workout__value">${obj.elevation}</span>
      <span class="workout__unit">spm</span>
    </div>
  </li>
`;
    }
    form.insertAdjacentHTML('afterend', html);
  }
  // local storage
  setLocalStorage() {
    localStorage.setItem('mashqlar', JSON.stringify(this.#mashqlar));
  }
  getLocalStorage() {
    let data = JSON.parse(localStorage.getItem('mashqlar'));
    if (!data) return;
    this.#mashqlar = data;
    this.#mashqlar.forEach(element => {
      this.renderList(element);
      this.setForm(element);
    });
  }
  removeLocalStorage() {
    localStorage.removeItem('mashqlar');
    location.reload();
  }

  moveCenter(e) {
    let element = e.target.closest('.workout');
    if (!element) return;
    let elementId = element.getAttribute('data-id');
    let objs = this.#mashqlar.find(val => {
      return val.id == elementId;
    });

    map.setView(objs.coodrs, 15, {
      animate: true,
      pan: {
        duration: 1,
      },
    });
    L.circle(objs.coodrs, { radius: 100 }).addTo(map);
  }
}

const magicMap = new App();
