def assert_equals(expected, actual):
    if expected != actual:
        print(f"Проверка провалена. Ожидалось {expected}, получено {actual}")
        exit(0)
    else:
        print(f"Тест пройден!")

def run_tests():
    actual = palindrome("racecar")
    assert_equals(True, actual)

    actual = palindrome("hello")
    assert_equals(False, actual)

    actual = palindrome("A man a plan a canal Panama")
    assert_equals(True, actual)


run_tests()
