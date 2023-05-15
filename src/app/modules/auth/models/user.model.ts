import { AuthModel } from './auth.model';

export class UserModel extends AuthModel {
  id: object;
  fullname: string;
  username: string;
  email: string;
  is_new_user: boolean;
  picUrl: string;
  password: string;
  confirmPassword: string;
}