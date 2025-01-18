from django.urls import path
from . import views_user, views_anime, views_friends, views_follow, views_chat
from django.contrib.auth import views as auth_views


urlpatterns = [
    path('genres/', views_anime.GenreList.as_view(), name='genre-list'),
    path('genres/delete/<int:pk>/', views_anime.GenreDelete.as_view(), name='genre-detail'),


    path('read-json/', views_anime.read_json_file_view),
    path('user/anime/', views_user.UserAnimeView.as_view(), name='user-anime'),
    path('user/anime/recent/<int:id>/', views_user.RecentAnimeView.as_view(), name='recent-anime'),
    path('user/anime/<int:id>/', views_user.UserAnimeByUsernameView.as_view(), name='user-anime-list-by-username'),
    path('anime/all/', views_anime.AnimeAllView.as_view(), name='anime-list'),
    path('user/anime/delete/<int:pk>/', views_user.UserAnimeDeleteView.as_view(), name='user-anime-delete'),


    path('user/anime/temp-deleted/', views_user.TempDeletedAnimeView.as_view(), name='user-anime-temp-deleted'),
    path('user/anime/temp-deleted/<int:pk>/', views_user.DeleteTempDeletedAnimeView.as_view(),
         name='user-anime-temp-deleted-delete'),
    path('user/anime/temp-deleted/delete-all/<int:pk>/', views_user.DeleteAllTmpDeletedAnimeView.as_view(),
         name='delete-all-temp-deleted-anime'),

    path('user/anime/update/<int:mal_id>/', views_user.UserAnimeUpdateView.as_view(), name='user-anime-update'),


    path('anime/quotes/', views_anime.AnimeQuotesView.as_view(), name='anime-quotes'),


    # PASSWORD RESET

    path('user/password-reset/', auth_views.PasswordResetView.as_view(), name='password_reset'),
    path('user/password-reset/done/', auth_views.PasswordResetDoneView.as_view(), name='password_reset_done'),
    path('user/password-change/', auth_views.PasswordChangeView.as_view(), name='password_change'),
    path('user/password-change/done/', auth_views.PasswordChangeDoneView.as_view(), name='password_change_done'),


    path('user/reset/<uidb64>/<token>/', auth_views.PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('user/reset/done/', auth_views.PasswordResetCompleteView.as_view(), name='password_reset_complete'),

    #USERS
    path('user/profile/<int:id>/', views_user.UserProfileView.as_view(), name='profile'),
    path('user/profile/<int:id>/update/', views_user.UserProfileUpdateView.as_view(), name='user_profile_update'),
    path('all/users/', views_user.AllUsersView.as_view(), name='all-users'),
    path('user/anime-list/<int:id>/', views_user.UserAnimeByIdView.as_view(), name='user-anime-list-by-id'),

    #FRIENDS
    path('user/friends/', views_friends.FriendListView.as_view(), name='friends'),
    path('user/friends/<int:id>/', views_friends.FriendListByIdView.as_view(), name='friends-by-id'),
    path('user/friends/add/<int:friendId>/', views_friends.FriendRequestView.as_view(), name='add-friend'),
    path('user/friends/requests/', views_friends.FriendRequestView.as_view(), name='friend-requests'),
    path('user/friend-request/accept/', views_friends.AcceptFriendRequestView.as_view(), name='accept-friend-request'),
    path('user/friend-request/deny/', views_friends.DeclineFriendRequestView.as_view(), name='deny-friend-request'),
    path('user/friends/unfriend/<int:user_id>/', views_friends.UnfriendView.as_view(), name='unfriend'),

    #FOLLOW
    path('user/follow/<int:user_id>/', views_follow.FollowUserView.as_view(), name='follow-user'),
    path('user/unfollow/<int:user_id>/', views_follow.UnfollowUserView.as_view(), name='unfollow-user'),
    path('user/followers/<int:id>/', views_follow.FollowersListByIdView.as_view(), name='followers'),
    path('user/following/<int:id>/', views_follow.FollowingListByIdView.as_view(), name='following'),

    #CHAT

    path('chats/', views_chat.ChatView.as_view(), name='chats'),
    path('chat/<str:room_name>/messages/', views_chat.ChatMessageListView.as_view(), name='chat-messages'),

]

