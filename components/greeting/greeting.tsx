import dayjs from "dayjs";

export default function Greeting() {
    const now = dayjs();
    const hour = now.hour();
    let greeting = "";
    if (hour < 12) {
        greeting = "早上好呀";
    } else if (hour < 18) {
        greeting = "下午好呀";
    } else {
        greeting = "晚上好呀";
    }
    return (
        <h1 className="text-center mb-8 text-3xl font-semibold leading-relaxed">
            {greeting}, 你今天看起来很聪明！
        </h1>
    )
}