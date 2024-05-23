function assertEquals(expected, actual) {
    if (expected !== actual) {
        console.log(`Проверка провалена. Ожидалось ${expected}, получено ${actual}`);
        process.exit(0)
    } else {
        console.log(`Тест пройден!`);
    }
}

let actual = palindrome("racecar");
assertEquals(true, actual);

actual = palindrome("hello");
assertEquals(false, actual);

actual = palindrome("A man a plan a canal Panama");
assertEquals(true, actual);