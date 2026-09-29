package com.example.attendease_api.controller;

import com.example.attendease_api.model.Classroom;
import com.example.attendease_api.model.Student;
import com.example.attendease_api.service.ClassroomService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api")
public class ClassroomController {

    private final ClassroomService classroomService;

    public ClassroomController(ClassroomService classroomService) {
        this.classroomService = classroomService;
    }

    @PostMapping("/classrooms")
    public Classroom createClassroom(@RequestBody Classroom classroom) {
        return classroomService.createClassroom(classroom);
    }

    @GetMapping("/classrooms")
    public List<Classroom> getAllClassrooms() {
        return classroomService.getAllClassrooms();
    }

    @PostMapping("/students")
    public Student addStudent(@RequestBody Student student) {
        return classroomService.addStudent(student);
    }

    @GetMapping("/classrooms/{id}/students")
    public List<Student> getStudents(@PathVariable Long id) {
        return classroomService.getStudentsByClassroom(id);
    }
}
