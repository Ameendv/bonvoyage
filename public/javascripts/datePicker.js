flatpickr(".datepicker1", {
  altInput: true,
  minDate: "today",

  altFormat: "F j, Y",
  dateFormat: "Y-m-d",
  disableMobile: "true",

  onChange(selectedDates) {
    flatpickr(".datepicker2", {
      altInput: true,
      position: "left",
      minDate: selectedDates[0].setDate(selectedDates[0].getDate() + 1),
      defaultDate: selectedDates[0].setDate(selectedDates[0].getDate()),
      altFormat: "F j, Y",
      dateFormat: "Y-m-d",
      disableMobile: "true",
      onChange(selectedDates) {
        const dateToForm = selectedDates[0];
      },
    });
  },
});
