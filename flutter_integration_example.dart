// lib/services/api_service.dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/destination.dart';
import '../models/user.dart';

class ApiService {
  static const String baseUrl = 'http://localhost:3001/api'; // Change for production
  
  String? _token;

  // Authentication
  Future<User> register(String email, String password, String fullName) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/register'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode({
        'email': email,
        'password': password,
        'fullName': fullName,
      }),
    );

    if (response.statusCode == 201) {
      return User.fromJson(json.decode(response.body));
    } else {
      throw Exception('Registration failed: ${json.decode(response.body)['error']}');
    }
  }

  Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode({
        'email': email,
        'password': password,
      }),
    );

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      _token = data['token'];
      return data;
    } else {
      throw Exception('Login failed: ${json.decode(response.body)['error']}');
    }
  }

  // Destinations
  Future<List<Destination>> getDestinations({
    String? province,
    String? category,
    bool? featured,
    String? query,
  }) async {
    final queryParams = <String, String>{};
    if (province != null) queryParams['province'] = province;
    if (category != null) queryParams['category'] = category;
    if (featured != null) queryParams['featured'] = featured.toString();
    if (query != null) queryParams['q'] = query;

    final uri = Uri.parse('$baseUrl/destinations').replace(queryParameters: queryParams);
    final response = await http.get(uri);

    if (response.statusCode == 200) {
      final List data = json.decode(response.body);
      return data.map((json) => Destination.fromJson(json)).toList();
    } else {
      throw Exception('Failed to load destinations');
    }
  }

  Future<Destination> getDestinationById(int id) async {
    final response = await http.get(Uri.parse('$baseUrl/destinations/$id'));

    if (response.statusCode == 200) {
      return Destination.fromJson(json.decode(response.body));
    } else {
      throw Exception('Destination not found');
    }
  }

  // Admin - Create destination
  Future<Destination> createDestination(Map<String, dynamic> data) async {
    if (_token == null) {
      throw Exception('Not authenticated');
    }

    final response = await http.post(
      Uri.parse('$baseUrl/admin/destinations'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $_token',
      },
      body: json.encode(data),
    );

    if (response.statusCode == 201) {
      return Destination.fromJson(json.decode(response.body));
    } else {
      throw Exception('Failed to create destination: ${json.decode(response.body)['error']}');
    }
  }
}

// lib/models/destination.dart
class Destination {
  final int id;
  final String name;
  final String province;
  final String category;
  final double rating;
  final String description;
  final String imageUrl;
  final int? entryFeeForeign;
  final int? entryFeeLocal;
  final bool featured;
  final double lat;
  final double lng;
  final List<String> secrets;

  Destination({
    required this.id,
    required this.name,
    required this.province,
    required this.category,
    required this.rating,
    required this.description,
    required this.imageUrl,
    this.entryFeeForeign,
    this.entryFeeLocal,
    required this.featured,
    required this.lat,
    required this.lng,
    required this.secrets,
  });

  factory Destination.fromJson(Map<String, dynamic> json) {
    return Destination(
      id: json['id'],
      name: json['name'],
      province: json['province'],
      category: json['category'],
      rating: (json['rating'] as num).toDouble(),
      description: json['description'],
      imageUrl: json['image_url'],
      entryFeeForeign: json['entry_fee_foreign'],
      entryFeeLocal: json['entry_fee_local'],
      featured: json['featured'] ?? false,
      lat: (json['lat'] as num).toDouble(),
      lng: (json['lng'] as num).toDouble(),
      secrets: json['secrets'] != null 
          ? List<String>.from(json['secrets'])
          : [],
    );
  }
}

// lib/models/user.dart
class User {
  final int id;
  final String email;
  final String fullName;
  final String role;

  User({
    required this.id,
    required this.email,
    required this.fullName,
    required this.role,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      email: json['email'],
      fullName: json['full_name'] ?? json['fullName'],
      role: json['role'] ?? 'user',
    );
  }
}

// Usage Example in Flutter Widget:
/*
class DestinationsScreen extends StatefulWidget {
  @override
  _DestinationsScreenState createState() => _DestinationsScreenState();
}

class _DestinationsScreenState extends State<DestinationsScreen> {
  final ApiService _apiService = ApiService();
  List<Destination> _destinations = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadDestinations();
  }

  Future<void> _loadDestinations() async {
    try {
      final destinations = await _apiService.getDestinations();
      setState(() {
        _destinations = destinations;
        _loading = false;
      });
    } catch (e) {
      setState(() => _loading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return Center(child: CircularProgressIndicator());
    }

    return ListView.builder(
      itemCount: _destinations.length,
      itemBuilder: (context, index) {
        final dest = _destinations[index];
        return ListTile(
          leading: Image.network(dest.imageUrl, width: 60, height: 60, fit: BoxFit.cover),
          title: Text(dest.name),
          subtitle: Text(dest.province),
          trailing: Text('\$${dest.entryFeeForeign}'),
          onTap: () {
            // Navigate to detail screen
          },
        );
      },
    );
  }
}
*/
