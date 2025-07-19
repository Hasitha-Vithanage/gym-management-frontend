import { Component } from '@angular/core';

@Component({
  selector: 'app-land',
  standalone: false,
  templateUrl: './land.component.html',
  styleUrl: './land.component.scss'
})
export class LandComponent {
  values = [
    {
      icon: '🎯',
      title: 'Excellence',
      description: 'We strive for the highest standards in everything we do.'
    },
    {
      icon: '🤝',
      title: 'Community',
      description: 'Building lasting relationships and supporting each other.'
    },
    {
      icon: '💡',
      title: 'Innovation',
      description: 'Constantly evolving our methods and equipment.'
    },
    {
      icon: '❤️',
      title: 'Wellness',
      description: 'Promoting holistic health and wellbeing.'
    }
  ];

  features = [
    {
      icon: '🏋️‍♀️',
      title: 'Modern Equipment',
      description: 'State-of-the-art machines and free weights from leading manufacturers.'
    },
    {
      icon: '🕐',
      title: 'Access Gym at your convenience',
      description: 'Work out on your schedule with round-the-clock facility access.'
    },
    {
      icon: '🎓',
      title: 'Certified Trainers',
      description: 'Expert guidance from nationally certified fitness professionals.'
    },
    {
      icon: '🧘',
      title: 'Wellness Programs',
      description: 'Comprehensive approach including nutrition and recovery services.'
    }
  ];

  team = [
    {
      name: 'Sarah Johnson',
      role: 'Head Trainer',
      bio: 'Certified personal trainer with 8+ years of experience in strength training and nutrition.',
      initials: 'SJ'
    },
    {
      name: 'Mike Rodriguez',
      role: 'Fitness Manager',
      bio: 'Former athlete turned fitness professional, specializing in sports performance.',
      initials: 'MR'
    },
    {
      name: 'Emma Chen',
      role: 'Yoga Instructor',
      bio: 'Certified yoga teacher focusing on mindfulness and flexibility training.',
      initials: 'EC'
    }
  ];
}
