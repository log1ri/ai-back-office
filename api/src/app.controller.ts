import { Controller, Get, Post, Put, Delete, Req, Param} from '@nestjs/common';
import { AppService } from './app.service';
import { Request } from 'express';
import { get } from 'http';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  private jokes = [
     {
      id: 1,
      jokeText: "Why don't scientists trust atoms? Because they make up everything.",
      jokeType: "Science",
    },
    {
      id: 2,
      jokeText: "Why did the scarecrow win an award? Because he was outstanding in his field.",
      jokeType: "Puns",
    },
    {
      id: 3,
      jokeText: "I told my wife she was drawing her eyebrows too high. She looked surprised.",
      jokeType: "Puns",
    },
];

  @Get()
  findall(){
    return this.jokes;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    const joke = this.jokes.find(j => j.id === parseInt(id));
    return joke;
  }

  @Post()
  getPost(): string {
    return this.appService.getPost();
  }

  @Get('/hi')
  getHi(): string {
    return 'Hello word';
  }
}




