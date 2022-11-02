# AppleSause

## Описание
Торговая площадка по типу Юлы или Авито упрощенном исполнении.

*Храмцов Андрей Игоревич 20.Б11-пу.*

## Наименование
AppleSause

## Предметная область
Любые товары или услуги, которые разместят пользователи

## Данные
![model](https://user-images.githubusercontent.com/73282986/199476953-7df0af07-23e4-4146-887d-19f45a31b48b.png)
- users - Пользователи
- roles - Роли пользователей
- ratings - Рейтинги (отзывы) которые пользователи оставляют на страницах других пользователей, rating - целое число от 1 до 5
- messages - Личные сообщения
- posts - Объявления
- categories - Категории объявлений и категорий
- favorites - Избранные объявления

## Общие ограничения целостности
- Категории нельзя редактировать никому кроме администраторов
- Личные сообщения между двумя пользователями доступны только этим двум пользователям

## Пользовательские роли

guest
- может просматривать объявления, размещенные на сайте

user
- может просматривать объявления, размещенные на сайте
- может добавлять любые открытые объявления на сайте в избранное
- может публиковать объявления
- может редактировать свои объявления
- может снимать свои ранее опубликованные объявления с публикации
- может помечать свои ранее опубликованные объявления как завершенные
- может писать и получать личные сообщения по поводу конкретного объявления (Объяснения: private messaging)
- может добавлять других пользователей в черный список (Объяснения: blacklisting)
- может оставлять оценки на страницах других пользователей (Объяснения: rating)

user_blocked
- может просматривать объявления, размещенные на сайте

moderator
- может всё что может user
- может блокировать чужие объявления (Объяснения: post blocking)
- может блокировать пользователей (Объяснения: user blocking)

administrator
- может всё что может moderator
- вероятно имеет прямой доступ к серверу, базе данных и исходному коду

## Объяснения
- private messaging - при просмотре объявления, размещенным пользователем 1, у пользователя 2 есть возможность написать пользователю 1 личное сообщение. Это сообщение будет помечено объявлением с которого оно было отправлено и будет располагаться в соответствующем диалоге. Дальнейшие сообщения отправленные в этом диалоге тоже будут помечены соответствующим объявлением. Отображаться сообщения будут как просто сообщения в диалоге связанным с определенным объявлением. Сообщения возможно отправлять только в рамках таких диалогов.
- blacklisting - если пользователь 1 добавит пользователя 2 в черный список то они больше не смогут писать друг другу личные сообщения пока пользователь 1 не уберт пользователя 2 из черного списка. Добавление пользователя 2 в черный список не избавляет пользователя 2 от возможности добавить пользователя 1 в черный список.
- rating - у пользователя 1 есть возможность оставить на странице пользователя 2 целочисленнную оценку от 1 до 5. Пользователем 1 на странице пользователя 2 может быть оставлена только одна оценка. На странице любого пользователя при этом отображается среднее значение всех оценок оставленнх ему.
Оценка может быть оставлена или изменена в любой момент вне зависимости от причины.
- user blocking - Блокировка пользователя происходит навсегда и без объяснения. Все ранее размещенные объявления которые находятся в открытом состоянии при блокировке пользователя тоже блокируются. Роль меняется на user_blocked.
- post blocking - Блокировка объявления происходит навсегда и без объяснения. После блокировки объявления пользователь теряет к нему доступ и объявление больше не рассматривается при любом способе поиска на сайте.

## Технологии разработки

*Вероятно будет изменено*

Языки программирования
- Python3.10
- JavaScript

Библиотеки и фреймворки
- FastAPI
- Pydantic
- SQLAlchemy
- Alembic
- psycopg2
- React

СУБД
- postgreSQL + pgmodeler
