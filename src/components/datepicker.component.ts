import { Component, EventEmitter, ViewEncapsulation, ElementRef } from "@angular/core";
import { NavParams, ViewController } from 'ionic-angular';

import { DatePickerData, DatePickerView } from './datepicker.interface';
import { DateService } from '../services/datepicker.service';

@Component({
    template: `<div class=\"datepicker-wrapper\">\n    <div class=\"datepicker-header\"\n        [ngClass]=\"config.headerClasses\">\n        <div class=\"weekday-header\">\n            <div class=\"weekday-title\"></div>\n        </div>\n        <div class=\"date-header\">\n            <div class=\"row\">\n                <div (tap)=\"setView(views.Month, getTempMonth(), months.length, yearScroll)\" class=\"col datepicker-month\">\n                    {{monthShort(getTempMonth())}}\n                </div>\n            </div>\n            <div class=\"row\">\n                <div (tap)=\"setView(views.Day, getTempDate(),getDayList().length, dayScroll)\" class=\"col datepicker-day-of-month \">\n                    {{getTempDate()}}    {{getSelectedWeekday()}}\n                </div>\n            </div>\n            <div class=\"row\">\n                <div  (tap)=\"setView(views.Year, getTempYear() - 1901, years.length, yearScroll)\" class=\"col datepicker-year \">\n                    {{ getTempYear()}}年\n                </div>\n            </div>\n        </div>\n    </div>\n    <div class=\"datepicker-calendar\" \n    *ngIf=\"view === views.Calendar\"\n        [ngClass]=\"config.bodyClasses\">\n        <div class=\"row col datepicker-controls\">\n            <button (tap)=\"prevMonth()\" ion-button>\n                    <ion-icon name=\"arrow-back\"></ion-icon>\n                </button>            \n                {{getTempYear()}}年 {{getTempMonth()}}\n            <button (tap)=\"nextMonth()\"ion-button>\n                    <ion-icon name=\"arrow-forward\"></ion-icon>\n            </button>\n        </div>\n        <div class=\"weekdays-row row\">\n            <span class=\"col calendar-cell\"\n                *ngFor=\"let dayOfWeek of weekdays\">\n                    {{dayOfWeekShort(dayOfWeek)}}\n                </span>\n        </div>\n        <div class=\"calendar-wrapper\">\n            <div class=\"row calendar-row\" *ngFor=\"let week of rows;let i = index;\">\n                <span class=\"col calendar-cell\"\n                    *ngFor=\"let day of cols;let j=index;\"\n                    [ngClass]=\"{\n                  'datepicker-date-col': getDate(i, j) !== undefined,\n                  'datepicker-selected': isSelectedDate(getDate(i, j)),\n                  'datepicker-current' : isActualDate(getDate(i, j)),\n                  'datepicker-disabled': isDisabled(getDate(i, j)),\n                  'datepicker-temp': isTempDate(getDate(i, j)),\n                  'datepicker-mark' : isMark(getDate(i, j))\n                  }\"\n                    (tap)=\"selectDate(getDate(i, j))\">\n\t\t\t\t\t{{getDateAsDay(i, j)}}\n\t\t\t\t</span>\n            </div>\n        </div>\n    </div>\n    <div [hidden]=\"view !== views.Year\" #yearScroll class=\"datepicker-rows\">\n        <ng-container  *ngFor=\"let year of years\">    \n            <div  *ngIf=\"testYear(year) && view === views.Year\" (tap)=\"setSelectedYear(year)\" [class.active]=\"getTempYear() === year\" [class.selected]=\"getSelectedYear() === year\" class=\"row\">\n                {{year}}年\n            </div>\n        </ng-container>\n    </div>\n        <div [hidden]=\"view !== views.Month\" #monthScroll class=\"datepicker-rows\">\n        <ng-container *ngFor=\"let month of months;let i = index\">\n            <div  *ngIf=\"testMonth(i)  && view === views.Month\" (tap)=\"setSelectedMonth(i)\" [class.active]=\"getTempMonth() === month\" [class.selected]=\"getSelectedMonth() === month\"   class=\"row\">\n                {{month}}\n            </div>\n        </ng-container>\n    </div>\n    <div [hidden]=\"view !== views.Day\" #dayScroll class=\"datepicker-rows\">\n       <ng-container *ngFor=\"let day of getDayList()\">\n            <div class=\"row\" *ngIf=\"testDay(day)  && view === views.Day\" [class.active]=\"getTempDate() === day\" [class.selected]=\"getSelectedDate() === day\" (tap)=\"setSelectedDay(day)\" >\n                {{day}}日\n            </div>\n        </ng-container>\n    </div>\n    <div class=\"datepicker-footer\">\n        <button (tap)=\"onCancel()\"\n            ion-button>\n            {{config.cancelText || 'Cancel'}}</button>\n        <button (tap)=\"onDone()\"\n            ion-button>\n            {{config.okText || 'OK'}}</button>\n    </div>\n</div>`,
    styles: [`ionic2-datepicker .col {\n        padding: 5px;\n        position: relative;\n        width: 100%;\n        margin: 0;\n        min-height: 1px;\n        -webkit-flex-basis: 0;\n        -ms-flex-preferred-size: 0;\n        flex-basis: 0;\n        -webkit-box-flex: 1;\n        -webkit-flex-grow: 1;\n        -ms-flex-positive: 1;\n        flex-grow: 1;\n        max-width: 100%;\n    }\n    ionic2-datepicker .row {\n        display: -webkit-box;\n        display: -webkit-flex;\n        display: -ms-flexbox;\n        display: flex;\n        -webkit-flex-wrap: wrap;\n        -ms-flex-wrap: wrap;\n        flex-wrap: wrap;\n      }\nionic2-datepicker .datepicker-wrapper {\n  height: 100%;\n  background-color: white;\n  display: flex;\n  flex-direction: column;\n  justify-content: space-between;\n}\nionic2-datepicker .datepicker-wrapper .datepicker-header {\n  color: white;\n  background-color: #acacac;\n  display: flex;\n  flex-flow: column;\n  height: 35%;\n}\nionic2-datepicker .datepicker-wrapper .datepicker-header .date-header {\n  display: flex;\n  flex-flow: column;\n  text-align: center;\n}\nionic2-datepicker .datepicker-wrapper .datepicker-header .date-header .datepicker-day-of-month {\n  font-size: 7.5vh;\n  font-weight: 700;\n}\nionic2-datepicker .datepicker-wrapper .datepicker-header .date-header .datepicker-year, ionic2-datepicker .datepicker-wrapper .datepicker-header .date-header .datepicker-month {\n  font-size: 5.5vh;\n  margin-top: 2px;\n  margin-bottom: 2px;\n}\nionic2-datepicker .datepicker-wrapper .datepicker-header .weekday-header {\n  padding: 7px 10px;\n  background-color: #acacac;\n}\nionic2-datepicker .datepicker-wrapper .datepicker-header         .weekday-header .weekday-title {\n  font-weight: bold;\n  text-align: center;\n  font-size: 1.8em;\n}\nionic2-datepicker .weekdays-row {\n  text-align: center;\n}\nionic2-datepicker .datepicker-calendar {\n  height: calc(100% - (35% + 60px));\n}\n\nionic2-datepicker .datepicker-rows {\n    height: calc(100% - (35% + 60px));\n    overflow-y:scroll;\n    display:flex;\n   flex-direction:column;\n    align-items:center;\n}\nionic2-datepicker .datepicker-rows .row {\n    min-height: 55px;\n    font-size: 1.5em;\n    display: flex;\n    align-items: center;\n    align-content: center;\n    flex-direction: column;\n    justify-content: center;\n    width: 100%;\n}\n\nionic2-datepicker .datepicker-rows .row.selected {\n    background-color: #b6d9d6;\n    border-radius: 20px;\n}\n\nionic2-datepicker .datepicker-rows .row.active {\n    background-color: #b6c2d9;\n    border-radius: 20px;\n}\n\nionic2-datepicker .datepicker-calendar .datepicker-controls {\n  align-items: center;\n  justify-content: space-between;\n  font-size: 1.2em;\n}\nionic2-datepicker .datepicker-calendar .calendar-wrapper {\n  height: calc(100% - 60px - 40px);\n  display: flex;\n  flex-direction: column;\n  justify-content: space-around;\n}\n\nionic2-datepicker .datepicker-calendar .calendar-wrapper .datepicker-mark {\n  background-color:#5b6c6b;\n  border-radius: 20px;\n}\nionic2-datepicker .datepicker-calendar .calendar-wrapper .datepicker-selected {\n  background-color: #b6d9d6;\n  border-radius: 20px;\n}\n\nionic2-datepicker .datepicker-calendar .calendar-wrapper .datepicker-temp {\n    background-color: #b6c2d9;\n    border-radius: 20px;\n}\n\nionic2-datepicker .datepicker-calendar .calendar-wrapper .datepicker-current {\n  color: #3caa9f;\n  border-radius: 20px;\n}\nionic2-datepicker .datepicker-calendar .calendar-wrapper .datepicker-disabled {\n  color: #aaaaaa;\n}\n\nionic2-datepicker .datepicker-calendar .calendar-wrapper .calendar-cell {\n  flex-flow: row wrap;\n  text-align: center;\n}\nionic2-datepicker .datepicker-footer {\n  display: flex;\n  justify-content: space-between;\n  height: 60px;\n}\nionic2-datepicker .datepicker-footer button {\n  width: 100%;\n}`],
    selector: 'ionic2-datepicker',
    encapsulation: ViewEncapsulation.None,
})

export class DatePickerComponent {

    /**
     * 
     * @type {DatePickerData} 
     * @description - represents the configuration of the datepicker
     * @memberof DatePickerComponent
     */
    public config: DatePickerData;
    /**
     * 
     * @type {Date}
     * @description - The currently selected date when opening the datepicker
     * @memberof DatePickerComponent
     */
    public selectedDate: Date = new Date();
    /**
     * 
     * @type {Date[]}
     * @description - The whole list of dates in a month
     * @memberof DatePickerComponent
     */
    public dateList: Date[];
    /**
     * 
     * @type {number[]}
     * @description - The columns of a month
     * @memberof DatePickerComponent
     */
    public cols: number[];
    /**
     * 
     * @type {number[]}
     * @description - The rows in a month
     * @memberof DatePickerComponent
     */
    public rows: number[];
    /**
     * 
     * @type {string[]}
     * @description - An array of the weekday names
     * @memberof DatePickerComponent
     */
    public weekdays: string[];
    /**
     * 
     * @type {string[]}
     * @description - An array of month names
     * @memberof DatePickerComponent
     */
    public months: string[];
    /**
     * 
     * @type {number[]}
     * @description - An array of the years
     * @memberof DatePickerComponent
     */
    public years: number[];
    /**
    * 
    * @type {DatePickerView}
    * @description - Current view of picker
    * @memberof DatePickerComponent
    */
    public view: DatePickerView = DatePickerView.Calendar;
    /**
    * 
    * @type {tyepof DatePickerView}
    * @description - List of view types
    * @memberof DatePickerComponent
    */
    public views: typeof DatePickerView = DatePickerView;
    /**
     * 
     * @private
     * @type {Date}
     * @description - The selected date after opening the datepicker
     * @memberof DatePickerComponent
     */

    private tempDate: Date;
    /**
     * 
     * @private
     * @type {Date}
     * @description - Today's date
     * @memberof DatePickerComponent
     */
    private today: Date = new Date();
    /**
     * 
     * Creates an instance of DatePickerComponent.
     * @param {ViewController} viewCtrl - dismissing the modal
     * @param {NavParams} navParams - carrying the navigation parameters
     * @param {DateService} DatepickerService - services for various things
     * @memberof DatePickerComponent
     */
    constructor(
        public viewCtrl: ViewController,
        public navParams: NavParams,
        public DatepickerService: DateService) {
        this.config = this.navParams.data;
        if (!this.config.calendar)
            this.view = this.views.Day;
        this.selectedDate = this.navParams.data.date;
        this.initialize();
    }


    /**
     * 
     * @function initialize - Initializes date variables
     */
    public initialize(): void {
        if (this.config.min)
            this.config.min.setHours(0, 0, 0, 0);
        if (this.config.max)
            this.config.max.setHours(0, 0, 0, 0);
        this.tempDate = this.selectedDate;
        this.createDateList(this.selectedDate);
        this.weekdays = this.DatepickerService.getDaysOfWeek();
        this.months = this.DatepickerService.getMonths();
        this.years = this.DatepickerService.getYears();
    }

    /**
     * 
     * @function createDateList - creates the list of dates
     * @param selectedDate - creates the list based on the currently selected date
     */
    public createDateList(selectedDate: Date): void {
        this.dateList = this.DatepickerService.createDateList(selectedDate);
        this.cols = new Array(7);
        this.rows = new Array(Math.ceil(this.dateList.length / this.cols.length));
    }

    /**
     * @function getDate - gets the actual date of date from the list of dates
     * @param row - the row of the date in a month. For instance 14 date would be 3rd or 2nd row
     * @param col - the column of the date in a month. For instance 1 would be on the column of the weekday.
     */
    public getDate(row: number, col: number): Date {
        /**
         * @description The locale en-US is noted for the sake of starting with monday if its in usa
         */
        return this.dateList[(row * 7 + col)];
    }

    /**
     * 
     * @function getDate - gets the actual number of date from the list of dates
     * @param row - the row of the date in a month. For instance 14 date would be 3rd or 2nd row
     * @param col - the column of the date in a month. For instance 1 would be on the column of the weekday.
     */
    public getDateAsDay(row: number, col: number): number {
        let date = this.getDate(row, col);
        if (date) return date.getDate();
    }

    /**
     * 
     * @function isDisabled - Checks whether the date should be disabled or not
     * @param date - the date to test against
     */
    public isDisabled(date: Date): boolean {
        if (!date) return true;
        if (this.config.min) {
            this.config.min.setHours(0, 0, 0, 0);
            if (date < this.config.min) return true;
        }
        if (this.config.max) {
            this.config.max.setHours(0, 0, 0, 0);
            if (date > this.config.max) return true;
        }
        if (this.config.disabledDates) {
            return this.config.disabledDates.some(disabledDate =>
                this.areEqualDates(new Date(disabledDate), date));
        }
        return false;
    }

    /**
    * 
    * @function testYear - Checks whether the year should be disabled or not
    * @param year - the year to test against
    */
    public testYear(year: number): boolean {
        if (year === undefined) return false;
        let testDate = new Date(year, this.tempDate.getMonth(), this.tempDate.getDate());
        return !this.isDisabled(testDate);
    }

    /**
    * 
    * @function testMonth - Checks whether the year should be disabled or not
    * @param month - the month to test against
    */
    public testMonth(month: number): boolean {
        if (month === undefined) return false;
        let testDate = new Date(this.tempDate.getFullYear(), month, this.tempDate.getDate());
        return !this.isDisabled(testDate);
    }

    /**
    * 
    * @function testMonth - Checks whether the year should be disabled or not
    * @param month - the month to test against
    */
    public testDay(day: number): boolean {
        if (day === undefined) return false;
        let testDate = new Date(this.tempDate.getFullYear(), this.tempDate.getMonth(), day);
        return !this.isDisabled(testDate);
    }

    /**
     * 
     * @function isMark - Checks whether the date should be marked
     * @param {Date} date - date to check
     * @returns {boolean} 
     * @memberof DatePickerComponent
     */
    public isMark(date: Date): boolean {
        if (!date) return false;
        if (this.config.markDates) {
            return this.config.markDates.some(markDate =>
                this.areEqualDates(new Date(markDate), date));
        }
        return false
    }
    /**
     * 
     * @function isActualDate - Checks whether the date is today's date.
     * @param {Date} date - date to check
     * @returns {boolean} 
     * @memberof DatePickerComponent
     */
    public isActualDate(date: Date): boolean {
        if (!date) return false;
        return this.areEqualDates(date, this.today);
    }

    /**
    * 
    * @function isSelectedDate - Checks whether the date is the selected date.
    * @param {Date} date - date to check
    * @returns {boolean} 
    * @memberof DatePickerComponent
    */
    public isSelectedDate(date: Date): boolean {
        if (!date) return false;
        return this.areEqualDates(date, this.selectedDate);
    }

    /**
    * 
    * @function isTempDate - Checks whether the date is the selected date.
    * @param {Date} date - date to check
    * @returns {boolean} 
    * @memberof DatePickerComponent
    */
    public isTempDate(date: Date): boolean {
        if (!date) return false;
        return this.areEqualDates(date, this.tempDate);
    }

    /**
     * 
     * @function selectDate - selects a date and emits back the date
     * @param {Date} date - date to select
     * @returns {void} 
     * @memberof DatePickerComponent
     */
    public selectDate(date: Date): void {
        if (this.isDisabled(date)) return;
        this.tempDate = date;
        this.tempDate.setHours(0, 0, 0, 0);
        this.config.ionSelected.emit(this.tempDate);
    }
    /**
     * 
     * @function getSelectedWeekday - Gets the selected date's weekday
     * @returns {string} 
     * @memberof DatePickerComponent
     */
    public getSelectedWeekday(): string {
        let day = this.tempDate.getDay();
        let dayAdjust = 0;
        // go back to sunday which is 6
        // TODO: FIND BETTER WAY TO DO THIS. LIKE A ROTATE ARRAY
        if (this.DatepickerService.doesStartFromMonday() && day === 0) dayAdjust = 6;
        // go back one day
        else if (this.DatepickerService.doesStartFromMonday()) dayAdjust = -1;
        return this.weekdays[day + dayAdjust];
    }

    /**
    * 
    * @function getSelectedMonth - Gets the selected date's name of month
    * @returns {string} 
    * @memberof DatePickerComponent
    */
    public getSelectedMonth(): string {
        return this.months[this.tempDate.getMonth()];
    }


    /**
    * 
    * @function getDayList - Gets the list of days
    * @returns {string[]} 
    * @memberof DatePickerComponent
    */
    public getDayList(): string[] {
        var date = new Date(this.tempDate.getFullYear(), this.tempDate.getMonth(), 1);
        var days = [];
        while (date.getMonth() === this.tempDate.getMonth()) {
            days.push(new Date(date).getDate());
            date.setDate(date.getDate() + 1);
        }
        return days;
    }

    /**
    * 
    * @function getTempMonth - Gets the temporary selected date's name of month
    * @returns {string} 
    * @memberof DatePickerComponent
    */
    public getTempMonth(): string {
        return this.months[this.tempDate.getMonth()];
    }

    /**
    * 
    * @function getTempYear - Gets the temporary selected date's year
    * @returns {number} 
    * @memberof DatePickerComponent
    */
    public getTempYear(): number {
        return (this.tempDate || this.selectedDate).getFullYear();
    }

    /**
    * 
    * @function getTempDate - Gets the temporary selected date's day
    * @returns {number} 
    * @memberof DatePickerComponent
    */
    public getTempDate(): number {
        return (this.tempDate || this.selectedDate).getDate();
    }

    /**
    * 
    * @function getSelectedDate - Gets selected date's date
    * @returns {number} 
    * @memberof DatePickerComponent
    */
    public getSelectedDate(): number {
        return (this.selectedDate || new Date()).getDate();
    }

    /**
    * 
    * @function getSelectedYear - Gets selected date's year
    * @returns {number} 
    * @memberof DatePickerComponent
    */
    public getSelectedYear(): number {
        return (this.selectedDate || new Date()).getFullYear();
    }

    /**
    * 
    * @function setSelectedMonth - Sets the selected month
    * @memberof DatePickerComponent
    */
    public setSelectedMonth(month: number): void {
        this.tempDate = new Date(this.tempDate.getFullYear(), month, this.tempDate.getDate());
        this.createDateList(this.tempDate);
        if (this.config.calendar)
            this.view = this.views.Calendar;
    }

    /**
    * 
    * @function setSelectedMonth - Sets the selected month
    * @memberof DatePickerComponent
    */
    public setSelectedDay(day: number): void {
        this.tempDate = new Date(this.tempDate.getFullYear(), this.tempDate.getMonth(), day);
        if (this.config.calendar)
            this.view = this.views.Calendar;
    }

    /**
    * 
    * @function setSelectedYear - Sets the selected year
    * @memberof DatePickerComponent
    */
    public setSelectedYear(year: number): void {
        this.tempDate = new Date(year, this.tempDate.getMonth(), this.tempDate.getDate());
        this.createDateList(this.tempDate);
        if (this.config.calendar)
            this.view = this.views.Calendar;
    }
    /**
    * 
    * @function setView - Sets the view and scrolls to the relevant row
    * @param {DatePickerView} view - the view to set
    * @param {number} index - index of date/month/year
    * @param {number} total - total amount of items
    * @param {HTMLElement} scrolledElement - element to scroll upon
    * @memberof DatePickerComponent
    */
    public setView(view: DatePickerView, index: number | string, total: number | string, scrolledElement: HTMLElement): void {
        this.view = view;
        setTimeout(() => {
            scrolledElement.scrollTop = (scrolledElement.scrollHeight / +total) * (+index - 1);
        }, 10);
    }
    /**
     * 
     * @function onCancel - activates on cancel and emits a cancel event
     * @memberof DatePickerComponent
     */
    public onCancel(): void {
        if (this.config.date)
            this.selectedDate = this.config.date || new Date();
        this.config.ionCanceled.emit();
        this.viewCtrl.dismiss();
    };

    /**
    * 
    * @function onDone - activates on done and emits date 
    * @memberof DatePickerComponent
    */
    public onDone(): void {
        this.config.date = this.tempDate;
        this.config.ionChanged.emit(this.config.date);
        this.viewCtrl.dismiss();
    };

    /**
     * 
     * @function limitTo - removes part of the string depending on a language and its needs
     * @param {(Array<string> | string)} arr - the array of strings to limit
     * @param {number} limit - amount to limit
     * @returns {(Array<string> | string)} 
     * @memberof DatePickerComponent
     */
    public limitTo(arr: Array<string> | string, limit: number): Array<string> | string {
        if (this.DatepickerService.locale === 'custom') return arr;

        if (Array.isArray(arr))
            return arr.splice(0, limit);
        if (this.DatepickerService.locale === 'zh-CN' || this.DatepickerService.locale === 'zh-TW')
            arr = arr.replace("星期", "")
        return (<string>arr).slice(0, limit);
    }

    /**
    * 
    * @function monthShort - returns the abbreviated month name
    * @param {(Array<string> | string)} arr - the array of strings to limit
    * @returns {(Array<string> | string)} 
    * @memberof DatePickerComponent
    */
    public monthShort(arr: Array<string> | string): Array<string> | string {
        return this.limitTo(arr, 3);
    }

    /**
    * 
    * @function dayOfWeekShort - returns the abbreviated day of week
    * @param {(Array<string> | string)} arr - the array of strings to limit
    * @returns {(Array<string> | string)} 
    * @memberof DatePickerComponent
    */
    public dayOfWeekShort(arr: Array<string> | string): Array<string> | string {
        let limit = 3;
        if (this.DatepickerService.locale === 'de') limit = 2;
        return this.limitTo(arr, limit);
    }

    /**
     * 
     * @function nextMonth - moves the calendar to the next month
     * @memberof DatePickerComponent
     */
    public nextMonth() {
        //if (this.max.getMonth() < this.tempDate.getMonth() + 1 && this.min.getFullYear() === this.tempDate.getFullYear()) return;
        let testDate: Date = new Date(this.tempDate.getTime());

        if (testDate.getMonth() === 11) {
            testDate.setFullYear(testDate.getFullYear() + 1);
            testDate.setMonth(0);
        }
        else {
            testDate.setMonth(testDate.getMonth() + 1);
        }
        if (testDate.getDate() !== this.tempDate.getDate()) {
            // something went wrong with the dates, oh oh.
            testDate = new Date(testDate.getFullYear(), testDate.getMonth(), 0);
        }
        let maxTestDate: Date;
        if (this.config.max) {
            maxTestDate = new Date(this.config.max);
            maxTestDate.setDate(0);
            maxTestDate.setMonth(maxTestDate.getMonth() + 1);
        }
        if (!maxTestDate || maxTestDate >= testDate) {
            if (maxTestDate && maxTestDate.getMonth() === testDate.getMonth()) {
                if (this.config.max.getDate() < testDate.getDate()) {
                    testDate.setDate(this.config.max.getDate());
                }
            }
            this.tempDate = testDate;
            this.createDateList(this.tempDate);
        }
    }

    /**
     * 
     * @function prevMonth - moves the calendar to the previous month
     * @memberof DatePickerComponent
     */
    public prevMonth() {
        let testDate: Date = new Date(this.tempDate.getTime());
        testDate.setMonth(testDate.getMonth() - 1);
        // testDate.setDate(this.tempDate.getDate());
        if (testDate.getDate() !== this.tempDate.getDate()) {
            // something went wrong with the dates, oh oh.
            testDate = new Date(testDate.getFullYear(), testDate.getMonth(), 0);
        }
        let minTestDate: Date;
        if (this.config.min) {
            minTestDate = new Date(this.config.min);
            minTestDate.setDate(1);
        }
        if (!minTestDate || minTestDate <= testDate) {
            if (minTestDate && minTestDate.getMonth() === testDate.getMonth()) {
                if (this.config.min.getDate() > testDate.getDate()) {
                    testDate.setDate(this.config.min.getDate());
                }
            }
            this.tempDate = testDate;
            this.createDateList(this.tempDate);
        }
    }

    /**
     * 
     * @function areEqualDates - compares 2 dates only by their month,date & year
     * @private
     * @param {Date} dateA - first date to compare
     * @param {Date} dateB - second date to compare
     * @returns 
     * @memberof DatePickerComponent
     */
    private areEqualDates(dateA: Date, dateB: Date): boolean {
        return dateA.getDate() === dateB.getDate() &&
            dateA.getMonth() === dateB.getMonth() &&
            dateA.getFullYear() === dateB.getFullYear();
    }
}