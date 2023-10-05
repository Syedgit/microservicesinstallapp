const array = [
  { fillDate: '2023-10-01', pres: 'Artipla' },
  { fillDate: '2023-10-04', pres: 'Met' },
  { fillDate: '2023-10-05', pres: 'Brufen' },
  { fillDate: '2023-10-06', pres: 'tab' },
];

// Define the start and end dates
const startDate = '2023-10-01';
const endDate = '2023-10-05';

// Filter the array based on the date range
const filteredArray = array.filter(item => {
  const fillDate = moment(item.fillDate);
  return fillDate.isSameOrAfter(startDate, 'day') && fillDate.isSameOrBefore(endDate, 'day');
});

console.log(filteredArray);
