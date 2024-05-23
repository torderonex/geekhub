package startup

const Up = `
CREATE TABLE IF NOT EXISTS users (
	id SERIAL PRIMARY KEY,
	username VARCHAR(128) UNIQUE,
	password VARCHAR(256)
);

CREATE TABLE IF NOT EXISTS projects (
	id SERIAL PRIMARY KEY,
	name VARCHAR(128),
	owner_id BIGINT REFERENCES users(id),
	path varchar(256) UNIQUE
);

CREATE TABLE IF NOT EXISTS files (
	id SERIAL PRIMARY KEY,
	project_id BIGINT REFERENCES projects(id),
	name VARCHAR(256)
);

CREATE TABLE IF NOT EXISTS task_types(
	id SERIAL PRIMARY KEY,
	name varchar(128)
);

DO $$ BEGIN
	CREATE TYPE difficulty_level AS ENUM ('Тяжелая', 'Легкая', 'Средняя');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS tasks (
	id SERIAL PRIMARY KEY,
	type_id BIGINT REFERENCES task_types(id),
	name varchar(128),
	description TEXT,
	difficulty difficulty_level
);

CREATE TABLE IF NOT EXISTS task_solutions(
	id SERIAL PRIMARY KEY,
	task_id BIGINT REFERENCES tasks(id),
	user_id BIGINT REFERENCES users(id),
	code TEXT,
	language varchar(128),
	status BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS task_testcases(
	id SERIAL PRIMARY KEY,
	task_id BIGINT REFERENCES tasks(id),
	input TEXT,
	output TEXT
);

CREATE TABLE IF NOT EXISTS invitations(
	id SERIAL PRIMARY KEY,
	project_id INTEGER NOT NULL REFERENCES projects(id),
    user_id INTEGER REFERENCES users(id) 
);

CREATE UNIQUE INDEX IF NOT EXISTS task_types_name_idx ON task_types(name);

INSERT INTO task_types (name) VALUES 
('JavaScript'), 
('Алгоритмы'), 
('SQL')
ON CONFLICT (name) DO NOTHING;

CREATE UNIQUE INDEX IF NOT EXISTS tasks_unique_idx ON tasks (type_id, description);

INSERT INTO tasks (type_id, name, description, difficulty) VALUES 
(2, 'add', 'Даны два целых числа ''a'' и ''b''. Верните их сумму.\n\nФункция ''sum'' принимает два аргумента:\n- ''a'' - первое число\n- ''b'' - второе число\n\nФункция должна вернуть сумму ''a'' и ''b''.\n\n> Пример 1:\n>\n> Ввод: ''a = 2'', ''b = 2''\n> Вывод: ''4''\n> Объяснение:\n> ''const result = add(a, b); // 4''\n> Функция добавляет 2 и 2 и получает 4.', 'Легкая'),
(2, 'palindrome', 'Дана строка ''s''. Верните true, если строка является палиндромом, и false в противном случае.\n\nПалиндром - это слово, фраза, число или другая последовательность символов, которая читается одинаково как вперед, так и назад (игнорируя пробелы, знаки препинания и регистр букв).\n\n> Пример 1:\n>\n> Ввод: ''s = "racecar"''\n> Вывод: true\n> Объяснение: ''racecar'' читается одинаково как вперед, так и назад.\n\n> Пример 2:\n>\n> Ввод: ''s = "hello"''\n> Вывод: false\n> Объяснение: ''hello'' не читается одинаково как вперед, так и назад.', 'Легкая'),
(2, 'twoSum', 'Дан массив целых чисел ''nums'' и целое число ''target''. Верните индексы двух чисел, сумма которых равна ''target''.\n\nВы можете предположить, что каждый входной массив имеет ровно одно решение, и каждый элемент может быть использован только один раз.\n\nВы можете вернуть ответ в любом порядке.\n\n> Пример 1:\n>\n> Ввод: ''nums = [2,7,11,15], target = 9''\n> Вывод: [0,1]\n> Объяснение: Поскольку ''nums[0] + nums[1] == 9'', мы возвращаем [0, 1].\n\n> Пример 2:\n>\n> Ввод: ''nums = [3,2,4], target = 6''\n> Вывод: [1,2]\n> Объяснение: Поскольку ''nums[1] + nums[2] == 6'', мы возвращаем [1, 2].', 'Средняя')
ON CONFLICT (type_id, description) DO NOTHING;

CREATE UNIQUE INDEX IF NOT EXISTS task_testcases_unique_idx ON task_testcases (task_id, input);

INSERT INTO task_testcases (task_id, input, output) VALUES 
(1, '2,2', '4'), 
(1, '5000,5', '5005'), 
(1, '-10,2', '-8'),

(2, 'racecar', 'true'), 
(2, 'hello', 'false'), 
(2, 'A man a plan a canal Panama', 'true'),

(3, '[2,7,11,15],9', '0,1'), 
(3, '[3,2,4],6', '1,2'), 
(3, '[3,3],6', '0,1')
ON CONFLICT (task_id, input) DO NOTHING;
`
