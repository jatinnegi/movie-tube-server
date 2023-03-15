const formatDate = (date) => {
  if (date === undefined) return "";
  const [year, month, day] = date.split("-");

  let monthString = "";

  const monthNum = +month;

  switch (monthNum) {
    case 1:
      monthString = "Jan";
      break;
    case 2:
      monthString = "Feb";
      break;
    case 3:
      monthString = "Mar";
      break;
    case 4:
      monthString = "Apr";
      break;
    case 5:
      monthString = "May";
      break;
    case 6:
      monthString = "Jun";
      break;
    case 7:
      monthString = "Jul";
      break;
    case 8:
      monthString = "Aug";
      break;
    case 9:
      monthString = "Sept";
      break;
    case 10:
      monthString = "Oct";
      break;
    case 11:
      monthString = "Nov";
      break;
    case 12:
      monthString = "Dec";
      break;

    default:
      break;
  }

  return `${day} ${monthString} ${year}`;
};

function formatMoney(money) {
  money = String(money);
  let moneyStringReverse = "";
  let moneyString = "";
  let digit = 1;

  if (money === "0") return "-";
  else if (money.length < 3) return money;
  else
    for (let i = money.length - 1; i >= 0; i--) {
      moneyStringReverse += money[i];
      if (digit % 3 === 0 && digit < money.length) moneyStringReverse += ",";
      digit++;
    }

  for (let i = moneyStringReverse.length - 1; i >= 0; i--)
    moneyString += moneyStringReverse[i];

  console.log(moneyString);

  return `$${moneyString}`;
}

module.exports = {
  formatDate,
  formatMoney,
};
