import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import {
    getFirestore,
    doc,
    getDoc,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


const firebaseConfig = {
    apiKey: "AIzaSyCL8-XcFDPFbFzxuHTC3KDVVEJcuXSeWVY",
    authDomain: "hw-calendar-cb09b.firebaseapp.com",
    projectId: "hw-calendar-cb09b",
    storageBucket: "hw-calendar-cb09b.firebasestorage.app",
    messagingSenderId: "1086869831015",
    appId: "1:1086869831015:web:5cdecac1123692a6b1c3c2"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const calendarDoc = doc(db, "calendar", "events");



let currentDate = new Date();
let selectedDateKey = null;
let events = {};


/* Event types: add a new one here + a matching option in index.html + CSS */

const EVENT_TYPES = {
    HW:      { label: "HOMEWORK", className: "" },
    PROJECT: { label: "PROJECT",  className: "project" },
    EXAM:    { label: "EXAM",     className: "exam" }
};


const calendar = document.getElementById("calendar");
const monthYear = document.getElementById("monthYear");

const overlay = document.getElementById("eventOverlay");
const closeButton = document.getElementById("closeEvent");

const previousMonth =
    document.getElementById("previousMonth");

const nextMonth =
    document.getElementById("nextMonth");

const saveButton =
    document.getElementById("saveEvent");


async function loadEvents() {

    try {

        console.log("Loading calendar data...");

        const snapshot =
            await getDoc(calendarDoc);


        if (snapshot.exists()) {

            const data = snapshot.data();

            events = data.events || {};

            console.log(
                "Loaded from Firestore:",
                events
            );

        } else {

            console.log(
                "Firestore document doesn't exist."
            );


            const oldData =
                localStorage.getItem(
                    "hwCalendarEvents"
                );


            if (oldData) {

                try {

                    events =
                        JSON.parse(oldData);

                    console.log(
                        "Recovered old localStorage data:",
                        events
                    );


                    await setDoc(
                        calendarDoc,
                        {
                            events: events
                        }
                    );


                    console.log(
                        "Old data migrated to Firestore."
                    );

                } catch (error) {

                    console.error(
                        "Could not read old data:",
                        error
                    );

                    events = {};
                }

            } else {

                events = {};

                await setDoc(
                    calendarDoc,
                    {
                        events: {}
                    }
                );
            }
        }


        createCalendar();

    } catch (error) {

        console.error(
            "Firebase load error:",
            error
        );


        try {

            const oldData =
                localStorage.getItem(
                    "hwCalendarEvents"
                );

            events = oldData
                ? JSON.parse(oldData)
                : {};

        } catch {

            events = {};
        }


        createCalendar();


        alert(
            "Could not load calendar data.\n\n" +
            error.message
        );
    }
}



async function saveEvents() {

    try {

        await setDoc(
            calendarDoc,
            {
                events: events
            }
        );

        console.log(
            "Calendar saved to Firestore."
        );

    } catch (error) {

        console.error(
            "Firebase save error:",
            error
        );

        throw error;
    }
}



function createCalendar() {

    calendar.innerHTML = "";


    const year =
        currentDate.getFullYear();

    const month =
        currentDate.getMonth();


    monthYear.textContent =
        currentDate.toLocaleDateString(
            "en-US",
            {
                month: "long",
                year: "numeric"
            }
        );


    const firstDay =
        new Date(
            year,
            month,
            1
        );


    let startingDay =
        firstDay.getDay() - 1;


    if (startingDay < 0) {
        startingDay = 6;
    }


    const daysInMonth =
        new Date(
            year,
            month + 1,
            0
        ).getDate();


    for (
        let i = 0;
        i < startingDay;
        i++
    ) {

        const emptyDay =
            document.createElement("div");

        emptyDay.className =
            "day empty";

        calendar.appendChild(
            emptyDay
        );
    }


    for (
        let day = 1;
        day <= daysInMonth;
        day++
    ) {

        const dayElement =
            document.createElement("div");

        dayElement.className =
            "day";


        const date =
            new Date(
                year,
                month,
                day
            );


        const dateKey =
            year +
            "-" +
            String(month + 1).padStart(2, "0") +
            "-" +
            String(day).padStart(2, "0");


        const weekday =
            date.toLocaleDateString(
                "en-US",
                {
                    weekday: "short"
                }
            );


        const dayNumber =
            document.createElement("div");

        dayNumber.className =
            "day-number";


        dayNumber.textContent =
            weekday +
            " " +
            String(day).padStart(2, "0") +
            "/" +
            String(month + 1).padStart(2, "0");


        dayElement.appendChild(
            dayNumber
        );


        /* Today */

        const today =
            new Date();


        if (
            day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear()
        ) {

            dayElement.classList.add(
                "today"
            );
        }


        if (events[dateKey]) {

            events[dateKey].forEach(
                (event, index) => {

                    const typeInfo =
                        EVENT_TYPES[event.type] ||
                        EVENT_TYPES.HW;


                    const eventElement =
                        document.createElement(
                            "div"
                        );

                    eventElement.className =
                        "event " +
                        typeInfo.className;


                    const typeElement =
                        document.createElement(
                            "div"
                        );

                    typeElement.className =
                        "event-type";

                    typeElement.textContent =
                        typeInfo.label;


                    const titleElement =
                        document.createElement(
                            "div"
                        );

                    titleElement.className =
                        "event-title";

                    titleElement.textContent =
                        event.title;


                    const descriptionElement =
                        document.createElement(
                            "div"
                        );

                    descriptionElement.className =
                        "event-description";

                    descriptionElement.textContent =
                        event.description || "";


                    const deleteButton =
                        document.createElement(
                            "button"
                        );

                    deleteButton.className =
                        "delete-event";

                    deleteButton.textContent =
                        "×";


                    deleteButton.addEventListener(
                        "click",
                        async function (e) {

                            e.stopPropagation();


                            if (
                                !confirm(
                                    "Delete this event?"
                                )
                            ) {
                                return;
                            }


                            events[dateKey].splice(
                                index,
                                1
                            );


                            if (
                                events[dateKey].length === 0
                            ) {

                                delete events[
                                    dateKey
                                ];
                            }


                            try {

                                await saveEvents();

                                createCalendar();

                            } catch (error) {

                                alert(
                                    "Could not delete the event."
                                );
                            }
                        }
                    );


                    eventElement.appendChild(
                        typeElement
                    );

                    eventElement.appendChild(
                        titleElement
                    );


                    if (event.description) {

                        eventElement.appendChild(
                            descriptionElement
                        );
                    }


                    eventElement.appendChild(
                        deleteButton
                    );


                    dayElement.appendChild(
                        eventElement
                    );
                }
            );
        }


        dayElement.addEventListener(
            "click",
            function () {

                openEventWindow(
                    dateKey
                );
            }
        );


        calendar.appendChild(
            dayElement
        );
    }
}



function openEventWindow(dateKey) {

    selectedDateKey =
        dateKey;


    overlay.classList.add(
        "active"
    );


    document.getElementById(
        "eventType"
    ).value = "HW";


    document.getElementById(
        "eventTitle"
    ).value = "";


    document.getElementById(
        "eventDescription"
    ).value = "";
}



function closeEventWindow() {

    overlay.classList.remove(
        "active"
    );

    selectedDateKey = null;
}


closeButton.addEventListener(
    "click",
    closeEventWindow
);


overlay.addEventListener(
    "click",
    function (e) {

        if (
            e.target === overlay
        ) {

            closeEventWindow();
        }
    }
);



saveButton.addEventListener(
    "click",
    async function () {

        if (!selectedDateKey) {
            return;
        }


        const type =
            document.getElementById(
                "eventType"
            ).value;


        const title =
            document.getElementById(
                "eventTitle"
            ).value.trim();


        const description =
            document.getElementById(
                "eventDescription"
            ).value.trim();


        if (!title) {

            alert(
                "Please enter a title."
            );

            return;
        }


        if (!events[selectedDateKey]) {

            events[selectedDateKey] =
                [];
        }


        events[selectedDateKey].push({

            type: type,

            title: title,

            description: description
        });


        try {

            await saveEvents();


            closeEventWindow();


            createCalendar();


        } catch (error) {


            events[selectedDateKey].pop();


            if (
                events[selectedDateKey].length === 0
            ) {

                delete events[
                    selectedDateKey
                ];
            }


            alert(
                "Could not save the event.\n\n" +
                error.message
            );
        }
    }
);



previousMonth.addEventListener(
    "click",
    function () {

        currentDate.setMonth(
            currentDate.getMonth() - 1
        );

        createCalendar();
    }
);


nextMonth.addEventListener(
    "click",
    function () {

        currentDate.setMonth(
            currentDate.getMonth() + 1
        );

        createCalendar();
    }
);



loadEvents();