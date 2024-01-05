const { exit } = require('process');

function createIcsSegment(input) {
    const TZDIFF = 5;
    const parts = input.split('\t');

    if (parts.length < 4) {
        return;
    }

    const summary = parts[0];

    const dateStrings = parts[1].split(" - ");

    // date should be in toronto timezone
    const start = new Date(`20${dateStrings[0].split("/").reverse().join("-")}`);
    const end = new Date(`20${dateStrings[1].split("/").reverse().join("-")}`);

    // workaround for timezone
    start.setHours(24 - TZDIFF);
    start.setMinutes(0);

    // set end to 11:59PM
    end.setHours(23 - TZDIFF);
    end.setMinutes(59);

    // set timezone to toronto
    end.setDate(end.getDate() + 1);

    console.log(parts[2])
    const regex = /^(\w+)\s(\d{1,2}):(\d{2})(AM|PM)\sto\s(\d{1,2}):(\d{2})(AM|PM)\s(.+)$/i;

    const matches = parts[2].match(regex);

    if (!matches) {
        return;
    }

    const weekday = matches[1];
    const startHour = parseInt(matches[2]);
    const startMinute = parseInt(matches[3]);
    const startMeridian = matches[4];
    const endHour = parseInt(matches[5]);
    const endMinute = parseInt(matches[6]);
    const endMeridian = matches[7];

    // Convert start and end times to 24-hour format
    let startHour24 = startHour;
    if (startMeridian === 'PM' && startHour !== 12) {
        startHour24 += 12;
    }
    let endHour24 = endHour;
    if (endMeridian === 'PM' && endHour !== 12) {
        endHour24 += 12;
    }

    const segStart = new Date(start);
    const segEnd = new Date(start);

    Date.prototype.addHours= function(h){
        this.setHours(this.getHours()+h);
        return this;
    }

    Date.prototype.addMinutes= function(m){
        this.setMinutes(this.getMinutes()+m);
        return this;
    }

    Date.prototype.addDays= function(d){
        this.setDate(this.getDate()+d);
        return this;
    }

    // get day in week of start date
    const dayInWeek = start.getDay();

    const dayMap = {
        'Sunday': 0,
        'Monday': 1,
        'Tuesday': 2,
        'Wednesday': 3,
        'Thursday': 4,
        'Friday': 5,
        'Saturday': 6,
    }

    const offset = dayMap[weekday] - dayInWeek - 1;

    console.log('offst', weekday, dayInWeek, dayMap[weekday], offset)

    // Create start and end time Date objects
    segStart.addDays(offset);
    segStart.addHours(startHour24);
    segStart.addMinutes(startMinute);
    segStart.setSeconds(0);
    segStart.setMilliseconds(0);

    segEnd.addDays(offset);
    segEnd.addHours(endHour24);
    segEnd.addMinutes(endMinute);
    segEnd.setSeconds(0);
    segEnd.setMilliseconds(0);

    const byday = weekday.toUpperCase().substring(0, 2);

    const startTime = segStart;

    const endTime = new Date(end);
    endTime.setHours(endHour24);
    endTime.setMinutes(endMinute);
    endTime.setSeconds(0);
    endTime.setMilliseconds(0);

    const location = parts[3];

    const organizer = parts[4];

    console.log({
        'summary': summary,
        'startTime': start,
        'endTime': end,
        'segStart': segStart,
        'segEnd': segEnd,
        'byday': byday,
        // format in iso
    })

    // convert segStart to ICS format datetime
    const formatDateToIcs = (dateObj) => {
        return dateObj.toISOString().replace(/[-:.]/g, '').substring(0, 15)
    }

    return `BEGIN:VEVENT
UID:${startTime.toISOString().replace(/[-:.]/g, '')}Z-21@yourapp.com
DTSTAMP:${startTime.toISOString().replace(/[-:.]/g, '')}Z
DTSTART;TZID=America/Toronto:${formatDateToIcs(segStart)}
DTEND;TZID=America/Toronto:${formatDateToIcs(segEnd)}
RRULE:FREQ=WEEKLY;UNTIL=${formatDateToIcs(end)};BYDAY=${byday}
SUMMARY:${summary}
LOCATION:${location.replace(/,/g, '\\,')}
DESCRIPTION:${parts[2]}
ORGANIZER;CN=${organizer}:mailto:noreply@example.com
END:VEVENT
`;
}

// read from file input.txt
const fs = require('fs');
const { off } = require('process');

const input = fs.readFileSync('input.txt', 'utf8');

// foreach everyline of input
const lines = input.split('\n');
const icsSegments = lines.map(line => createIcsSegment(line));

const HEADER = `
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//YourAppName//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH

BEGIN:VTIMEZONE
TZID:America/Toronto
BEGIN:STANDARD
DTSTART:16010101T020000
RRULE:FREQ=YEARLY;BYDAY=1SU;BYMONTH=11
TZOFFSETFROM:-0400
TZOFFSETTO:-0500
TZNAME:EST
END:STANDARD
BEGIN:DAYLIGHT
DTSTART:16010101T020000
RRULE:FREQ=YEARLY;BYDAY=2SU;BYMONTH=3
TZOFFSETFROM:-0500
TZOFFSETTO:-0400
TZNAME:EDT
END:DAYLIGHT
END:VTIMEZONE`;

const FOOTER = `END:VCALENDAR`;

// write to file output.ics
fs.writeFileSync('output.ics', `${HEADER}
${icsSegments.join('\n')}
${FOOTER}`);

// const input = 'INFO-6123-01 Web Design\t26/06/23 - 11/08/23\tMonday 02:00PM to 03:00PM OL Lecture\tOl Online, Room ONLINE\tW. Roberts';
// const icsSegment = createIcsSegment(input);
// console.log(icsSegment);
