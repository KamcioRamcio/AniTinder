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



]

