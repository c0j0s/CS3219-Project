enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
  OTHER = "OTHER",
}

enum Role {
  ADMIN = "ADMIN",
  USER = "USER",
}

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role; //enum
  isVerified: boolean;

  //optional attributes
  gender?: Gender;
  bio?: string;
  // languages?: Language[];
  image?: string;
  createdOn?: Date;
  updatedOn?: Date;
};

export type Source = {
  user: string;
  pass: string;
};

export type Email = {
  source: Source;
  recipient: string;
  subject: string;
  content: string;
};
