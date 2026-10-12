from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):

    fieldsets = UserAdmin.fieldsets + (
        (
            "CampusIQ Information",
            {
                "fields": (
                    "role",
                    "student_id",
                    "faculty_id",
                    "department",
                    "phone",
                    "profile_picture",
                )
            },
        ),
    )

    add_fieldsets = UserAdmin.add_fieldsets + (
        (
            "CampusIQ Information",
            {
                "fields": (
                    "role",
                    "student_id",
                    "faculty_id",
                    "department",
                    "phone",
                    "profile_picture",
                )
            },
        ),
    )