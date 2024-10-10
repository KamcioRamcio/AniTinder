from django.urls import path
from . import views
from django.contrib.auth import views as auth_views


urlpatterns = [
    path('genres/', views.GenreList.as_view(), name='genre-list'),
    path('genres/delete/<int:pk>/', views.GenreDelete.as_view(), name='genre-detail'),


    path('read-json/', views.read_json_file_view),
    path('user/anime/', views.UserAnimeView.as_view(), name='user-anime'),
    path('user/anime/recent/<int:id>/', views.RecentAnimeView.as_view(), name='recent-anime'),
    path('user/anime/<int:id>/', views.UserAnimeByUsernameView.as_view(), name='user-anime-list-by-username'),
    path('anime/all/', views.AnimeAllView.as_view(), name='anime-list'),
    path('user/anime/delete/<int:pk>/', views.UserAnimeDeleteView.as_view(), name='user-anime-delete'),
    path('user/anime/temp-deleted/', views.TempDeletedAnimeView.as_view(), name='user-anime-temp-deleted'),
    path('user/anime/update/<int:mal_id>/', views.UserAnimeUpdateView.as_view(), name='user-anime-update'),


    path('anime/quotes/', views.AnimeQuotesView.as_view(), name='anime-quotes'),
    #path('user/anime/<int:id>/',)

    # PASSWORD RESET

    path('user/password-reset/', auth_views.PasswordResetView.as_view(), name='password_reset'),
    path('user/password-reset/done/', auth_views.PasswordResetDoneView.as_view(), name='password_reset_done'),
    path('user/password-change/', auth_views.PasswordChangeView.as_view(), name='password_change'),
    path('user/password-change/done/', auth_views.PasswordChangeDoneView.as_view(), name='password_change_done'),


    path('user/reset/<uidb64>/<token>/', auth_views.PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('user/reset/done/', auth_views.PasswordResetCompleteView.as_view(), name='password_reset_complete'),

    #USERS
    path('user/profile/<int:id>/', views.UserProfileView.as_view(), name='profile'),
    path('user/profile/<int:id>/update/', views.UserProfileUpdateView.as_view(), name='user_profile_update'),
    path('all/users/', views.AllUsersView.as_view(), name='all-users'),

    #FRIENDS
    path('user/friends/', views.FriendListView.as_view(), name='friends'),
    path('user/friends/<int:id>/', views.FriendListByIdView.as_view(), name='friends-by-id'),
    path('user/friends/add/<int:friendId>/', views.FriendRequestView.as_view(), name='add-friend'),
    path('user/friends/requests/', views.FriendRequestView.as_view(), name='friend-requests'),
    path('user/friend-request/accept/', views.AcceptFriendRequestView.as_view(), name='accept-friend-request'),
    path('user/friend-request/deny/', views.DeclineFriendRequestView.as_view(), name='deny-friend-request'),
    path('user/friends/unfriend/<int:user_id>/', views.UnfriendView.as_view(), name='unfriend'),

    #FOLLOW
    path('user/follow/<int:user_id>/', views.FollowUserView.as_view(), name='follow-user'),
    path('user/unfollow/<int:user_id>/', views.UnfollowUserView.as_view(), name='unfollow-user'),
    path('user/followers/<int:id>/', views.FollowersListByIdView.as_view(), name='followers'),
    path('user/following/<int:id>/', views.FollowingListByIdView.as_view(), name='following'),
]

