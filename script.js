'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// ### BANKIST APP

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [1200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2022-11-01T13:15:33.035Z',
    '2022-11-30T09:48:16.867Z',
    '2022-12-25T06:04:23.907Z',
    '2023-01-25T14:18:46.235Z',
    '2023-02-05T16:33:06.386Z',
    '2023-08-10T14:43:26.374Z',
    '2023-08-13T18:49:59.371Z',
    '2023-08-14T12:01:20.894Z',
  ],
  currency: 'INR',
  locale: 'en-IN', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2022-11-01T13:15:33.035Z',
    '2022-11-30T09:48:16.867Z',
    '2022-12-25T06:04:23.907Z',
    '2023-01-25T14:18:46.235Z',
    '2023-02-05T16:33:06.386Z',
    '2023-04-10T14:43:26.374Z',
    '2023-07-13T18:49:59.371Z',
    '2023-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

// ### Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

const formateMovementDate = function (date, locale) {
  const calcDayspassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const dayPassed = calcDayspassed(new Date(), date);

  if (dayPassed === 0) return 'Today';
  if (dayPassed === 1) return 'Yesterday';
  if (dayPassed <= 7) return `${dayPassed} days ago`;

  // const day = now.getDate();
  // ### add 0 at start for one digit date. we need string for that.
  // const day = `${date.getDate()}`.padStart(2, 0);

  // ### getMonth method is 0 based
  // const month = `${date.getMonth() + 1}`.padStart(2, 0);
  // const year = date.getFullYear();
  // return `${day}/${month}/${year}`;

  // ### Internalization API
  return new Intl.DateTimeFormat(locale).format(date);
};

// ### function to format currency
const formatCurrency = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  // ### we don't  want to change the original array so we are using slice to duplicate the array
  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;
  movs.forEach(function (movement, i) {
    const type = movement > 0 ? 'deposit' : 'withdrawal';
    // ### we need to convert string to js obj so we can work with data
    const date = new Date(acc.movementsDates[i]);

    const displayDate = formateMovementDate(date, acc.locale);

    const formattedMovement = formatCurrency(
      movement,
      acc.locale,
      acc.currency
    );

    const html = `
        <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
        <div class="movements__date">${displayDate}</div>
        <div class="movements__value"> ${formattedMovement}</div>
        </div>`;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const createUserName = function (accs) {
  accs.forEach(acc => {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};

createUserName(accounts);

const updateUI = function (acc) {
  // ### Display movements
  displayMovements(acc);

  // ### Display Balance
  calcDisplayBalance(acc);

  // ### Display Summary
  calcDisplaySummary(acc);
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = formatCurrency(
    acc.balance,
    acc.locale,
    acc.currency
  );
};

const calcDisplaySummary = function (acc) {
  const income = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, curr) => acc + curr, 0);
  labelSumIn.textContent = formatCurrency(income, acc.locale, acc.currency);

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, curr) => acc + curr, 0);
  labelSumOut.textContent = formatCurrency(out, acc.locale, acc.currency);

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter(int => int >= 1)
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formatCurrency(
    interest,
    acc.locale,
    acc.currency
  );
};

// ### Timer to logout
const startLogoutTimer = function () {
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);

    // ### in each call, print the remaing time to UI
    labelTimer.textContent = `${min} : ${sec}`;

    // ### when timer reaches 0 second, stop the timer and logout the user
    if (time === 0) {
      clearInterval(logoutTimer);
      labelWelcome.textContent = 'Log in to get started';
      containerApp.style.opacity = 0;
    }

    // ### decrease 1 second
    time--;
  };

  // ### set time to 5 minutes
  let time = 120;

  tick();
  // ### call the timer every second
  const logoutTimer = setInterval(tick, 1000);
  return logoutTimer;
};

// ### Event Handlers
let currentAccount, timer;

// ### FAKE always logged in
// currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = 100;

btnLogin.addEventListener('click', function (e) {
  // ### Prevent form from submitting
  e.preventDefault();
  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  // ### Optional chaining
  // pin property will only be read if current account exist

  // ### +() will work as type coercion(the process of converting a value from one data type to another)
  // same as converting like Number()
  if (currentAccount?.pin === +inputLoginPin.value) {
    // ### Display UI and welcome Message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    // ### create current date and time
    const now = new Date();

    // #### Old code in which manually editing and showing dates
    // const day = now.getDate();
    // add 0 at start for one digit date. we need string for that.
    // const day = `${now.getDate()}`.padStart(2, 0);

    // ### getMonth method is 0 based
    // const month = `${now.getMonth() + 1}`.padStart(2, 0);
    // const year = now.getFullYear();
    // const hour = `${now.getHours()}`.padStart(2, 0);
    // const min = `${now.getMinutes()}`.padStart(2, 0);

    // labelDate.textContent = `${day}/${month}/${year}, ${hour}:${min}`;

    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      // weekday: 'long',
    };

    // ### get the locale from user's browser
    const locale = navigator.language;

    labelDate.textContent = Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);

    // ### Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    // ### Call logout timer
    if (timer) clearInterval(timer);
    timer = startLogoutTimer();

    // ### Update UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  // ### +() will work as type coercion(the process of converting a value from one data type to another)
  // same as converting like Number()
  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  // ### Clear input fields
  inputTransferTo.value = inputTransferAmount.value = '';
  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    setTimeout(function () {
      // ### Doing the transfer
      currentAccount.movements.push(-amount);
      receiverAcc.movements.push(amount);

      // ### Add transfer date
      currentAccount.movementsDates.push(new Date().toISOString());
      receiverAcc.movementsDates.push(new Date().toISOString());

      // ### Update UI
      updateUI(currentAccount);

      // ### Timer Reset
      clearInterval(timer);
      timer = startLogoutTimer();
    }, 2500);
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  // ### +() will work as type coercion(the process of converting a value from one data type to another)
  // same as converting like Number()
  // const amount = +inputLoanAmount.value;
  const amount = Math.floor(inputLoanAmount.value);

  // ### Only give loan if any transaction is greater or equal to 10%
  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    setTimeout(function () {
      // ### Add the movement
      currentAccount.movements.push(amount);

      // ### Add loan date
      currentAccount.movementsDates.push(new Date().toISOString());

      // ### Update the UI
      updateUI(currentAccount);
    }, 2500);
  }

  // ### Clear input fields
  inputLoanAmount.value = '';

  // ### Timer Reset
  clearInterval(timer);
  timer = startLogoutTimer();
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();
  if (
    inputCloseUsername.value === currentAccount.username &&
    // ### +() will work as type coercion(the process of converting a value from one data type to another)
    // same as converting like Number()
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    // ### Delete account
    accounts.splice(index, 1);

    // ### Hide the UI
    containerApp.style.opacity = 0;
  }
  inputLoginUsername.value = inputLoginPin.value = '';
});

// ### To preserve the sorted state, then flip it on sort button click
let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});

const currencies = new Map([
  ['USD', 'United States dollar'],
  ['CAD', 'Canadian dollar'],
  ['INR', 'Indian Rupees'],
]);

const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

const USDtoCAD = 1.33;
const movementsCAD = movements.map(function (mov) {
  return mov * USDtoCAD;
});
console.log(movements);

console.log(movementsCAD);
/////////////////////////////////////////////////
