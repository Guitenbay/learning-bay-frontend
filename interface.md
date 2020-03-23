# 前后端接口文档

## 前置

Http Methods
- `GET`: 获取数据
- `PUT`: 创建数据
- `POST`: 更新数据
- `DELETE`: 删除数据

## 登录
url: `/signin`
```json
{
  username: string,
  password: string
}
```
return
```json
{
  res: boolean,
  data: {
    uri: string
  }
}
```

## 个人信息
- url: `/user?uri=user-uri` GET
  return
  ```json
  {
    res: boolean,
    data: {
      uri: string,
      username: string,
      password: string
    }
  }
  ```
- url: `/user` PUT/POST
  ```json
  {
    id: string,
    username: string,
    password: string,
  }
  ```
  return
  ```json
  {
    res: boolean
  }
  ```
- url: `/user?uri=user-uri` DELETE
  return
  ```json
  {
    res: boolean
  }

## 个人学习状态
- url: `/user-state?uri=user-uri` GET
  return
  ```json
  {
    res: boolean,
    data: {
      uri: string,
      state: [{
        kElementUri: string,
        state: int
      }, ...]
    }
  }
  ```
- url: `/user-state` PUT/POST
  ```json
  {
    uri: string,
    state: [{
      kElementUri: string,
      state: int
    }, ...]
  }
  ```
  return
  ```json
  {
    res: boolean
  }
  ```
- url: `/user-state?uri=user-uri` DELETE
  return
  ```json
  {
    res: boolean
  }

## 推荐小节
- url: `/recommand?uri=user-uri` GET
  return
  ```json
  {
    res: boolean,
    data: {
      sectionUris: string[]
    }
  }
  ```

## 课程
- url: `/course/all` GET
  return
  ```json
  {
    res: boolean,
    data: [{
      uri: string,
      title: string
    }]
  }
  ```
- url: `/course?uri=course-uri` GET
  return
  ```json
  {
    res: boolean,
    data: {
      uri: string,
      title: string
    }
  }
  ```
- url: `/course` PUT/POST
  ```json
  {
    id: string,
    title: string
  }
  ```
  return
  ```json
  {
    res: boolean
  }
  ```
- url: `/course?uri=course-uri` DELETE
  return
  ```json
  {
    res: boolean
  }

## 章
- url: `/chapter/all` GET
  return
  ```json
  {
    res: boolean,
    data: [{
      uri: string,
      title: string
    }]
  }
  ```
- url: `/chapter/all?uri=course-uri` GET
  return
  ```json
  {
    res: boolean,
    data: [{
      uri: string,
      title: string
    }]
  }
  ```
- url: `/chapter?uri=chapter-uri` GET
  return
  ```json
  {
    res: boolean,
    data: {
      uri: string,
      title: string
    }
  }
  ```
- url: `/chapter` PUT/POST
  ```json
  {
    id: string,
    title: string,
    belongs: string
  }
  ```
  return
  ```json
  {
    res: boolean
  }
  ```
- url: `/chapter?uri=chapter-uri` DELETE
  return
  ```json
  {
    res: boolean
  }

## 节
- url: `/lesson/all` GET
  return
  ```json
  {
    res: boolean,
    data: [{
      uri: string,
      title: string,
      meidaUri: string,
    }]
  }
  ```
- url: `/lesson/all?uri=chapter-uri` GET
  return
  ```json
  {
    res: boolean,
    data: [{
      uri: string,
      title: string,
      meidaUri: string,
    }]
  }
  ```
- url: `/lesson?uri=lesson-uri` GET
  return
  ```json
  {
    res: boolean,
    data: {
      uri: string,
      title: string,
      meidaUri: string,
    }
  }
  ```
- url: `/lesson` PUT/POST
  ```json
  {
    id: string,
    title: string,
    meidaUri: string,
    belongs: string
  }
  ```
  return
  ```json
  {
    res: boolean
  }
  ```
- url: `/lesson?uri=lesson-uri` DELETE
  return
  ```json
  {
    res: boolean
  }

## 小节
- url: `/section/all` GET
  return
  ```json
  {
    res: boolean,
    data: [{
      uri: string,
      title: string,
      codeQuestionUri: string,
      kElementUri: string
    }]
  }
  ```
- url: `/section/all?uri=lesson-uri` GET
  return
  ```json
  {
    res: boolean,
    data: [{
      uri: string,
      title: string,
      codeQuestionUri: string,
      kElementUri: string
    }]
  }
  ```
- url: `/section?uri=section-uri` GET
  return
  ```json
  {
    res: boolean,
    data: {
      uri: string,
      title: string,
      codeQuestionUri: string,
      kElementUri: string
    }
  }
  ```
- url: `/section` PUT/POST
  ```json
  {
    id: string,
    title: string,
    codeQuestionUri: string,
    kElementUri: string,
    belongs: string
  }
  ```
  return
  ```json
  {
    res: boolean
  }
  ```
- url: `/section?uri=section-uri` DELETE
  return
  ```json
  {
    res: boolean
  }

## 视频
- url: `/media-material/all` GET
  return
  ```json
  {
    res: boolean,
    data: [{
      uri: string,
      title: string,
      description: string,
      type: string,
      filename: string,
      creator: string,
      date: string
    }]
  }
  ```
- url: `/media-material?uri=mm-uri` GET
  return
  ```json
  {
    res: boolean,
    data: {
      uri: string,
      title: string,
      description: string,
      type: string,
      filename: string,
      creator: string,
      date: string
    }
  }
  ```
- url: `/media-material` PUT/POST
  ```json
  {
    id: string,
    title: string,
    description: string,
    type: string,
    filename: string,
    creator: string,
    date: string
  }
  ```
  return
  ```json
  {
    res: boolean
  }
  ```
- url: `/media-material?uri=mm-uri` DELETE
  return
  ```json
  {
    res: boolean
  }

## 题目
- url: `/code-question/all` GET
  return
  ```json
  {
    res: boolean,
    data: [{
      uri: string,
      title: string,
      content: string,
      code: string,
      testSetFilename: string,
      kElementUris: string[]
      creator: string,
      date: string
    }]
  }
  ```
- url: `/code-question/all?uri=course-uri` GET
  return
  ```json
  {
    res: boolean,
    data: [{
      uri: string,
      title: string,
      content: string,
      code: string,
      testSetFilename: string,
      kElementUris: string[]
      creator: string,
      date: string
    }]
  }
  ```
- url: `/code-question?uri=cq-uri` GET
  return
  ```json
  {
    res: boolean,
    data: {
      uri: string,
      title: string,
      content: string,
      code: string,
      testSetFilename: string,
      kElementUris: string[]
      creator: string,
      date: string
    }
  }
  ```
- url: `/code-question` PUT/POST
  ```json
  {
    id: string,
    title: string,
    content: string,
    code: string,
    testSetFilename: string,
    belongs: string,
    kElementUris: string[]
    creator: string,
    date: string
  }
  ```
  return
  ```json
  {
    res: boolean
  }
  ```
- url: `/code-question?uri=cq-uri` DELETE
  return
  ```json
  {
    res: boolean
  }