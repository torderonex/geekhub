# Geekhub compiler

###
**About:** 
Full-stack Real-time Code Compiler with AI and LeetCode Tasks. Built on MIREA spring 2024 Hackathon - React (TS) + Go

![image](https://github.com/user-attachments/assets/dcef5d4f-f866-4973-b6c7-a805dab1e945)

![image](https://github.com/user-attachments/assets/ddf484b2-b81e-40bf-84f7-34a81d9dceba)

![image](https://github.com/user-attachments/assets/b6100326-fcd0-407f-8377-1e6b8d587ebc)

![image](https://github.com/user-attachments/assets/8d394e1d-ae86-4b02-9e9d-1eaed3593031)

![image](https://github.com/user-attachments/assets/df724b4a-d17b-41ad-ae68-5b1356299c5e)

![image](https://github.com/user-attachments/assets/94b7fc1c-ee99-42ba-94fd-ea17ec0d3606)

![image](https://github.com/user-attachments/assets/33e0f75f-f196-4e7a-a82e-29c70e8760c2)

---

## Main features

### Editor Page
* Compile code - JS, Python, Golang, and C++ supported
* Create projects, add files there and compile your projects
* Import files from your PC and download file/project to your PC
* Open AI chat and get answers to all your programming questions - based on YandexGPT
* Let AI review your code and suggest you a better version of it

### Tasks Page
* Filter tasks by type (algorithms, js tasks and etc), by difficulty (easy, medium and hard) and status (pending or done)
* You can choose any language to solve task - if its not a task for a specific language
* Track input data, expected result and final result on all cases - errors too

### Additional
* Invite people to your project via project links and build projects in real time
* Switch themes - light and dark
* Internationalization with RU and EN languages - i18n
* JWT auth 

---

### To view it locally - client

Enter client folder:

```bash
cd client
```

Make sure to install the dependencies:

```bash
# npm 
npm i
```

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev
```

### To view it locally - server

```bash
cd client
go run cmd/app/main.go
```
