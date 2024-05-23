def assert_equals(expected, actual):
    if expected != actual:
        print(f"Проверка провалена. Ожидалось {expected}, получено {actual}")
        exit(0)
    else:
        print(f"Тест пройден!")

def run_tests():
    actual = add(2, 2)
    assert_equals(4, actual)

    actual = add(5000, 5)
    assert_equals(5005, actual)

    actual = add(-10, 2)
    assert_equals(-8, actual)


run_tests()
