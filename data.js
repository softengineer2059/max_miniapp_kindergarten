const DB = {
    kindergarten: {
        name: "Детский сад «Солнышко»",
        shortName: "«Солнышко»"
    },

    schedule: [
        { day: "Понедельник", time: "07:30 – 17:30", closed: false },
        { day: "Вторник",     time: "07:30 – 17:30", closed: false },
        { day: "Среда",       time: "07:30 – 17:30", closed: false },
        { day: "Четверг",     time: "07:30 – 17:30", closed: false },
        { day: "Пятница",     time: "07:30 – 17:30", closed: false },
        { day: "Суббота",     time: "Выходной",       closed: true  },
        { day: "Воскресенье", time: "Выходной",       closed: true  }
    ],

    contacts: [
        { icon: "📞", label: "Телефон", value: "+7 (988) 787-34-67", type: "tel" },
        { icon: "📧", label: "Email", value: "mkdou_ds_solnyhko@e-dag.ru", type: "mail" },
        { icon: "💬", label: "MAX", value: "Написать нам в MAX", type: "max", url: "https://max.ru/u/f9LHodD0cOIKV8y8nu1_herb3uB51EvgYBtugn0CZUu8ynyLqn-ZQQWoJaI" }
    ],

    address: {
        text: "368730, Республика Дагестан, Ахтынский р-н, с Ахты, ул Герейханова, 15",
        mapUrl: "https://yandex.ru/maps/?text=Ахты+Герейханова+15",
        transport: "Недалеко от парка Ю. Герейханова"
    }
};