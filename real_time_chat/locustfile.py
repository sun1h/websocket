from locust import HttpUser, task, between

class MyUser(HttpUser):
    wait_time = between(1, 3)  # 요청 사이의 대기 시간을 설정합니다.

    @task
    def my_task(self):
        self.client.get("/")  # 테스트할 URL을 입력합니다.

