import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { AvatarComponent } from './components/avatar/avatar.component';
import { SkeletonComponent } from './components/skeleton/skeleton.component';
import { EmptyStateComponent } from './components/empty-state/empty-state.component';
import { ModalComponent } from './components/modal/modal.component';
import { FollowButtonComponent } from './components/follow-button/follow-button.component';
import { UserCardComponent } from './components/user-card/user-card.component';
import { CreatePostComponent } from './components/create-post/create-post.component';
import { ImageUploadComponent } from './components/image-upload/image-upload.component';
import { PostCardComponent } from './components/post-card/post-card.component';
import { CommentSectionComponent } from './components/comment-section/comment-section.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { RightSidebarComponent } from './components/right-sidebar/right-sidebar.component';
import { MobileNavComponent } from './components/mobile-nav/mobile-nav.component';
import { TimeAgoPipe } from './pipes/time-ago.pipe';

@NgModule({
  declarations: [
    AvatarComponent,
    SkeletonComponent,
    EmptyStateComponent,
    ModalComponent,
    FollowButtonComponent,
    UserCardComponent,
    CreatePostComponent,
    ImageUploadComponent,
    PostCardComponent,
    CommentSectionComponent,
    NavbarComponent,
    SidebarComponent,
    RightSidebarComponent,
    MobileNavComponent,
    TimeAgoPipe
  ],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  exports: [
    AvatarComponent,
    SkeletonComponent,
    EmptyStateComponent,
    ModalComponent,
    FollowButtonComponent,
    UserCardComponent,
    CreatePostComponent,
    ImageUploadComponent,
    PostCardComponent,
    CommentSectionComponent,
    NavbarComponent,
    SidebarComponent,
    RightSidebarComponent,
    MobileNavComponent,
    TimeAgoPipe
  ]
})
export class SharedModule {}
