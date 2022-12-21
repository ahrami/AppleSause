# AppleSause

## Запуск
usernames:

presold (moderator)

raphidoidea (moderator)

elmy (moderator)

whitewood (moderator)

accelerated

harperess

alcarraza

colocynthin

smudder

stalactitical

password: password


## Описание
Торговая площадка по типу Юлы или Авито упрощенном исполнении.

*Храмцов Андрей Игоревич 20.Б11-пу.*

## Предметная область
Любые товары или услуги, которые разместят пользователи

## Данные
![model](https://user-images.githubusercontent.com/73282986/199699493-750096d3-78e5-434a-afbe-d704d9f2b3a5.png)
- users - Пользователи
- roles - Роли пользователей
- ratings - Рейтинги (оценки) которые пользователи оставляют на страницах других пользователей (Объяснения: rating)
- messages - Личные сообщения
- dialogues - Диалог по объявлению
- posts - Объявления
- categories - Категории объявлений
- favorites - Избранные объявления
- blacklist - записи о добавленных пользователями других пользователей в черный список

## Общие ограничения целостности
- Категории возможно редактировать только напрямую в базе данных
- Личные сообщения между двумя пользователями доступны только этим двум пользователям

## Пользовательские роли

#### guest (Эта роль не существует явно)
- может просматривать объявления, размещенные на сайте

#### user
- может просматривать объявления, размещенные на сайте
- может добавлять любые открытые объявления на сайте в избранное
- может публиковать объявления
- может снимать свои ранее опубликованные объявления с публикации (Объяснения: post deleting)
- может помечать свои ранее опубликованные объявления как завершенные (Объяснения: post closing)
- может писать и получать личные сообщения по поводу конкретного объявления (Объяснения: private messaging)
- может добавлять других пользователей в черный список (Объяснения: blacklisting)
- может оставлять оценки на страницах других пользователей (Объяснения: rating)

#### user_blocked (Отменено)
- может просматривать объявления, размещенные на сайте

#### moderator
- может всё что может user
- может блокировать чужие объявления (Объяснения: post blocking)
- может блокировать пользователей (Объяснения: user blocking)

#### administrator
- может всё что может moderator
- вероятно имеет прямой доступ к базе данных

## Объяснения

#### private messaging

- При просмотре объявления, размещенным пользователем (1), у пользователя (2) есть возможность написать пользователю (1) личное сообщение.
- Сообщение отправленное со страницы объявления будет расположено в соответствующем диалоге (если его нет то он будет создан).
- Сообщения отправленные в конкретном диалоге будут располагаться в этом конкретном диалоге.
- Сообщения возможно отправлять только в рамках диалогов, связанных с объявлениями.

#### blacklisting
- Если пользователь (1) добавит пользователя (2) в черный список то они больше не смогут писать друг другу личные сообщения пока пользователь (1) не уберет пользователя (2) из черного списка.
- Добавление пользователем (1) пользователя (2) в черный список не избавляет пользователя (2) от возможности добавить пользователя (1) в черный список.

#### rating
- У пользователя (1) есть возможность оставить на странице пользователя (2) целочисленнную оценку от 1 до 5.
- Пользователем (1) на странице пользователя (2) может быть оставлена только одна оценка. 
- На странице любого пользователя отображается среднее значение всех оценок оставленнх ему.
- Оценка может быть оставлена или изменена пользователем который её оставил в любой момент без объяснения причины.

#### post deleting
- Удаленное объявление нельзя восстановить. 
- После удаления объявления пользователь теряет к нему доступ и объявление больше не рассматривается при любом способе поиска на сайте.

#### user blocking (Теперь это просто удаление пользователя)
- Блокировка пользователя происходит навсегда и без объяснения. 
- Все ранее размещенные объявления которые находятся в не удаленном состоянии при блокировке пользователя тоже блокируются. 
- Роль меняется на user_blocked.

#### post blocking 
- Блокировка объявления происходит навсегда и без объяснения. 
- При блокировке объявление удаляется (post deleting)

#### post closing
- Закрытое объявление отображается в закрытых объявлениях на странице владельца объявления

## Технологии разработки

Языки программирования
- JavaScript
- HTML
- CSS

СУБД
- postgreSQL + pgmodeler
